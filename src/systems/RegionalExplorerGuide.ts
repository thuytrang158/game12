import Phaser from 'phaser';
import { SaveManager } from './SaveManager';
import { UIManager } from '../ui/UIManager';
import { IRegionProgress } from '../types/game';
import { DESTINATIONS } from '../data/destinations';

export interface ExplorationStop {
  id: string;
  label: string;
  x: number;
  y: number;
}

/** Shared six-stop field guide. Proximity records a visit only; it never completes a quest activity. */
export class RegionalExplorerGuide {
  private visited: Set<string>;
  private lastCell = '';
  private markerObjects: Phaser.GameObjects.GameObject[] = [];

  constructor(
    private scene: Phaser.Scene,
    private regionId: string,
    private title: string,
    private stops: ExplorationStop[],
    private getPlayer: () => Phaser.GameObjects.Components.Transform,
    private getObjective: () => string,
    private onFastTravel: (stop: ExplorationStop) => void
  ) {
    const save = SaveManager.getInstance().load();
    const current = save.regionProgress?.[regionId];
    this.visited = new Set(current?.visitedStops || []);
    this.createMarkers();
    this.render();
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  public update() {
    const player = this.getPlayer();
    if (!player) return;
    const cell = `${Math.floor(player.x / 24)}:${Math.floor(player.y / 24)}:${UIManager.getInstance().isAnyModalOpen()}:${UIManager.getInstance().isDialogueOpen()}`;
    for (const stop of this.stops) {
      if (this.visited.has(stop.id)) continue;
      if (Phaser.Math.Distance.Between(player.x, player.y, stop.x, stop.y) <= 42) this.visit(stop);
    }
    if (cell !== this.lastCell) {
      this.lastCell = cell;
      this.render();
    }
  }

  public getVisitedStopIds() {
    return [...this.visited];
  }

  public destroy = () => {
    this.markerObjects.forEach(object => object.destroy());
    this.markerObjects = [];
    UIManager.getInstance().clearExplorationGuide(this.regionId);
  };

  private createMarkers() {
    // Đền Đuổm draws its small contextual seals beside the actual landmarks.
    if (this.regionId === 'den_duom') return;
    this.stops.forEach((stop, index) => {
      const marker = this.scene.add.container(stop.x, stop.y - 34).setDepth(1000);
      const circle = this.scene.add.circle(0, 0, 10, this.visited.has(stop.id) ? 0x638b45 : 0xf4c978).setStrokeStyle(2, 0x1d3b2b);
      const label = this.scene.add.text(0, 0, `${index + 1}`, { fontSize: '10px', color: '#1D3B2B', fontStyle: 'bold' }).setOrigin(0.5);
      marker.add([circle, label]);
      this.markerObjects.push(marker);
      if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        this.scene.tweens.add({ targets: marker, y: marker.y - 3, duration: 1100, yoyo: true, repeat: -1 });
      }
    });
  }

  private visit(stop: ExplorationStop) {
    this.visited.add(stop.id);
    const save = SaveManager.getInstance().load();
    save.regionProgress ||= {};
    const progress: IRegionProgress = save.regionProgress[this.regionId] || { visitedStops: [], completedActivities: [] };
    progress.visitedStops = [...new Set([...progress.visitedStops, stop.id])];
    const player = this.getPlayer();
    progress.player = { x: player.x, y: player.y, dir: 'down' };
    save.regionProgress[this.regionId] = progress;
    save.passportStamps ||= {};
    save.passportStamps[`${this.regionId}_stop_${stop.id}`] = true;
    SaveManager.getInstance().save(save);
    UIManager.getInstance().showToast(`Đã ghi dấu: ${stop.label}. Điểm tham quan và nhiệm vụ chính được tính riêng.`);
    this.render();
  }

  private render() {
    const player = this.getPlayer();
    const closest = this.stops.filter(stop => !this.visited.has(stop.id)).sort((a, b) =>
      Phaser.Math.Distance.Between(player.x, player.y, a.x, a.y) - Phaser.Math.Distance.Between(player.x, player.y, b.x, b.y)
    )[0];
    const objective = this.getObjective();
    const visible = !UIManager.getInstance().isAnyModalOpen() && !UIManager.getInstance().isDialogueOpen();
    UIManager.getInstance().renderExplorationGuide({
      regionId: this.regionId,
      title: this.title,
      subtitle: DESTINATIONS[this.regionId]?.subtitle || 'Hành trình khám phá xứ Trà',
      stops: this.stops.map(stop => ({ ...stop, visited: this.visited.has(stop.id), highlighted: closest?.id === stop.id })),
      objective,
      player: { x: player.x, y: player.y },
      visible,
      onFastTravel: stopId => {
        const stop = this.stops.find(candidate => candidate.id === stopId);
        if (stop && this.visited.has(stop.id)) this.onFastTravel(stop);
      },
      onOpenCard: () => UIManager.getInstance().openDestinationCard(this.regionId)
    });
  }
}
