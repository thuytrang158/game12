import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { UIManager } from '../ui/UIManager';
import { QuestManager } from '../systems/QuestManager';
import { SaveManager } from '../systems/SaveManager';
import { AudioManager } from '../systems/AudioManager';
import { initializeRegionSystems, persistRegionCheckpoint, transitionToRegion } from '../systems/RegionRegistry';
import { LakeJourney } from '../systems/LakeJourney';
import { LakeExperience } from '../ui/LakeExperience';
import { LakeFieldGuide } from '../ui/LakeFieldGuide';
import { registerLakeArt } from '../assets/lakeArt';
import { LAKE_SIZE, LAKE_STOPS, LAKE_DOCKS, LAKE_ISLANDS, MAINLAND, LakeStopId, isLakeLand, nextLakeObjective, pointInPolygon } from '../data/lake';
import '../ui/lake.css';

type DockId = typeof LAKE_DOCKS[number]['id'];
type Point = { x: number; y: number };

/** A continuous, schematic lake landscape with real named landmarks and playable boat travel. */
export class HoNuiCocScene extends Phaser.Scene {
  private player!: Player;
  private journey!: LakeJourney;
  private experience!: LakeExperience;
  private guide!: LakeFieldGuide;
  private boat!: Phaser.GameObjects.Image;
  private boating = false;
  private lastSafe: Point = { x: 340, y: 1220 };
  private lastBoat: Point = { x: 850, y: 905 };
  private currentDock: DockId = 'shore';
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private touch?: AbortController;
  private touchVector: Point = { x: 0, y: 0 };
  private obstacles: Phaser.Geom.Rectangle[] = [];
  private nearby: LakeStopId | null = null;
  private waypoint: LakeStopId | null = null;
  private route: Point[] = [];
  private cruiseTarget?: DockId;
  private toolbar!: HTMLElement;
  private waypointText!: Phaser.GameObjects.Text;
  private waypointRing!: Phaser.GameObjects.Arc;
  private sunsetTint!: Phaser.GameObjects.Rectangle;
  private saveAt = 0;
  private fountainJets: Phaser.GameObjects.Rectangle[] = [];
  private npcs: NPC[] = [];
  private reducedMotion = false;
  private leaving = false;

  constructor() { super({ key: 'HoNuiCocScene' }); }

  create() {
    this.boating=false;this.leaving=false;this.obstacles=[];this.nearby=null;this.route=[];this.cruiseTarget=undefined;
    this.touchVector={x:0,y:0};this.fountainJets=[];this.npcs=[];this.currentDock='shore';this.saveAt=0;
    this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    initializeRegionSystems('ho_nui_coc');
    this.journey=new LakeJourney();this.journey.initialize();
    const ui=UIManager.getInstance();ui.closeDialogue();ui.setHUDVisible(true);ui.setRegionName('Hồ Núi Cốc');ui.updateHUDQuest();
    registerLakeArt(this);this.createEnvironment();
    const saved=this.journey.progress.player;
    const start=saved&&this.walkable(saved.x,saved.y)?saved:{x:340,y:1220,dir:'up' as const};
    this.lastSafe={x:start.x,y:start.y};this.player=new Player(this,start.x,start.y);this.player.setDirection(start.dir);
    this.currentDock=this.areaDock(start.x,start.y);
    this.boat=this.add.image(850,905,'lake_boat').setDepth(905);
    this.lastBoat={x:850,y:905};
    this.cameras.main.setBounds(0,0,LAKE_SIZE.width,LAKE_SIZE.height);
    this.cameras.main.startFollow(this.player,true,.12,.12);this.cameras.main.setZoom(1.15);this.cameras.main.fadeIn(350);
    this.experience=new LakeExperience(this.journey,{
      onChange:()=>{ui.updateHUDQuest();this.save();},
      onNavigate:id=>this.navigate(id),onBoat:()=>this.board(),onCruise:target=>this.cruise(target),
      onLight:light=>this.sunsetTint.setAlpha(light==='sunset'?.12:0)
    });
    this.guide=new LakeFieldGuide(this.journey,(id,fast)=>this.navigate(id,fast),()=>this.objective());
    this.waypointText=this.add.text(0,0,'',{fontSize:'11px',color:'#fff3ca',backgroundColor:'#173b35',padding:{x:7,y:5}}).setOrigin(.5).setDepth(15000);
    this.waypointRing=this.add.circle(0,0,26,0xf4cc82,.15).setStrokeStyle(2,0xf4cc82).setDepth(11000).setVisible(false);
    this.keys=this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,ENTER') as Record<string,Phaser.Input.Keyboard.Key>;
    this.createToolbar();this.bindTouch();
    ui.setOnTravelCallback(region=>{
      if(region==='ho_nui_coc'){ui.closeAllModals();return;}
      this.save();this.leaving=transitionToRegion(this,'ho_nui_coc',region,{...this.lastSafe,dir:this.player.getDirection()});
    });
    const visibility=()=>{if(document.hidden){this.resetInput();this.save();}};
    document.addEventListener('visibilitychange',visibility,{signal:this.touch!.signal});
    window.addEventListener('pagehide',()=>this.save(),{signal:this.touch!.signal});
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      if(!this.leaving)this.save();this.touch?.abort();this.experience.destroy();this.guide.destroy();this.toolbar.remove();ui.hidePrompt();ui.closeAllModals();
      this.route=[];this.boating=false;
    });
    this.time.delayedCall(450,()=>ui.showToast('Hồ Núi Cốc · 12 điểm dừng, một hành trình giữa cảnh quan và câu chuyện'));
    this.waypoint='arrival';
  }

  private createEnvironment() {
    this.physics.world.setBounds(0,0,LAKE_SIZE.width,LAKE_SIZE.height);
    if(!this.textures.exists('lake_landscape_v2')) {
      const canvas=document.createElement('canvas');canvas.width=LAKE_SIZE.width;canvas.height=LAKE_SIZE.height;
      const c=canvas.getContext('2d')!;
      const waterGradient=c.createLinearGradient(0,0,canvas.width,canvas.height);waterGradient.addColorStop(0,'#4c8c88');waterGradient.addColorStop(.45,'#397a80');waterGradient.addColorStop(1,'#2f6878');c.fillStyle=waterGradient;c.fillRect(0,0,canvas.width,canvas.height);
      let seed=73;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
      for(let i=0;i<5500;i++){const x=Math.floor(random()*2400/4)*4,y=Math.floor(random()*1600/4)*4;c.fillStyle=i%3?'#438580':'#7ab0a2';c.globalAlpha=.24;c.fillRect(x,y,12+Math.floor(random()*30),2);}c.globalAlpha=1;
      c.beginPath();MAINLAND.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle='#788f55';c.fill();c.lineWidth=20;c.strokeStyle='#c1bd82';c.stroke();
      for(const island of LAKE_ISLANDS){const pts=island.vertices;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle='#aab47a';c.fill();c.lineWidth=14;c.strokeStyle='#c1bd82';c.stroke();c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x-8,y-8):c.moveTo(x-8,y-8));c.closePath();c.fillStyle=island.id==='nui_cai'?'#748e51':'#6d8952';c.fill();}
      for(let i=0;i<4200;i++){const x=Math.floor(random()*2400/4)*4,y=Math.floor(random()*1600/4)*4;if(!isLakeLand(x,y))continue;c.fillStyle=i%2?'#84985a':'#6b844f';c.fillRect(x,y,3,5);}
      c.strokeStyle='#c8ba83';c.lineWidth=36;c.lineCap='round';
      c.beginPath();c.moveTo(440,300);c.lineTo(440,1300);c.lineTo(2240,1300);c.stroke();
      for(const [x,y] of [[300,385],[300,735],[340,1190],[690,905],[730,1400],[1150,1310],[1780,1430],[2170,1300]]){c.beginPath();c.moveTo(x,y);c.lineTo(x<500?440:x,y<1100?y:1300);if(x>=500&&y<1100)c.lineTo(440,y);c.stroke();}
      c.lineWidth=22;c.beginPath();c.moveTo(1500,555);c.lineTo(1500,390);c.moveTo(1730,960);c.lineTo(1830,875);c.stroke();
      for(const [x,y,w,h] of [[560,875,245,65],[1475,530,50,100],[1705,925,50,85]]){
        c.fillStyle='#8f704b';c.fillRect(x,y,w,h);for(let i=0;i<h;i+=10){c.fillStyle='#c2a16b';c.fillRect(x+2,y+i+1,w-4,7);}
      }
      this.textures.addCanvas('lake_landscape_v2',canvas);
    }
    this.add.image(0,0,'lake_landscape_v2').setOrigin(0).setDepth(-100);
    const rng=new Phaser.Math.RandomDataGenerator(['nui-coc-forest']);
    for(let i=0;i<160;i++){
      const x=rng.between(25,2375),y=rng.between(30,1550);
      if(!isLakeLand(x,y)||LAKE_STOPS.some(s=>Math.hypot(s.x-x,s.y-y)<120)||LAKE_DOCKS.some(d=>Math.hypot(d.foot.x-x,d.foot.y-y)<100)||Math.abs(x-440)<65||Math.abs(y-1300)<70)continue;
      const tree=this.add.image(x,y,'lake_tree').setOrigin(.5,1).setScale(rng.realInRange(.65,1.15)).setDepth(y);
      this.obstacles.push(new Phaser.Geom.Rectangle(x-10,y-12,20,15));
      tree.setTint(i%4===0?0xd3d29a:0xffffff);
    }
    this.landmark('lake_gate',340,1140,1,false);
    this.landmark('lake_palace',300,685,1,true);
    this.landmark('lake_pagoda',300,330,1,true);
    this.landmark('lake_dam',2170,1220,1,true);
    this.landmark('lake_house',1500,360,1,true);
    this.landmark('lake_gate',1500,520,.7,false);
    this.landmark('lake_market',730,1360,1,true);
    this.landmark('lake_house',140,1320,.8,true);
    this.landmark('lake_market',170,1500,.7,true);
    this.add.rectangle(1150,1195,245,110,0x264e4b).setStrokeStyle(7,0xb4b38a).setDepth(1195);
    this.obstacles.push(new Phaser.Geom.Rectangle(1020,1128,260,120));
    for(let i=0;i<13;i++){
      const jet=this.add.rectangle(1054+i*16,1208,5,35,0xa0dbd0).setOrigin(.5,1).setDepth(1209);this.fountainJets.push(jet);
      this.add.rectangle(1054+i*16,1213,11,3,0xd4c28b).setDepth(1214);
    }
    this.add.rectangle(1780,1430,148,64,0x9a7c52).setDepth(-60);
    for(let i=0;i<12;i++)this.add.rectangle(1712+i*12,1430,2,63,0xc5aa73).setDepth(-59);
    this.add.rectangle(1780,1406,150,6,0xd2ba83).setDepth(1406);
    for(let i=0;i<8;i++){
      const bird=this.add.image(1740+i*23,780+(i%3)*26,'lake_bird').setScale(.65).setDepth(800);
      if(!this.reducedMotion)this.tweens.add({targets:bird,x:bird.x+12,y:bird.y-8,duration:1900+i*100,yoyo:true,repeat:-1});
    }
    const water=this.add.graphics().setDepth(-70);water.lineStyle(2,0xc2dfc1,.35);
    for(let i=0;i<35;i++){const x=730+(i*113)%1590,y=80+(i*89)%920;if(isLakeLand(x,y))continue;water.lineBetween(x,y,x+26,y);}
    if(!this.reducedMotion)this.tweens.add({targets:water,alpha:.3,x:8,duration:2600,yoyo:true,repeat:-1});
    LAKE_STOPS.forEach((stop,i)=>{
      const label=this.add.text(stop.x,stop.y-58,`${String(i+1).padStart(2,'0')} · ${stop.name}`,{fontSize:'12px',fontFamily:'sans-serif',color:'#f7e8bd',backgroundColor:'#23483b',padding:{x:9,y:6}}).setOrigin(.5).setDepth(12000).setInteractive({useHandCursor:true});
      label.on('pointerdown',()=>{const ui=UIManager.getInstance();if(ui.isAnyModalOpen()||this.boating)return;if(Math.hypot(this.player.x-stop.x,this.player.y-stop.y)>90){this.navigate(stop.id);return;}this.interact(stop.id);});
      this.add.circle(stop.x,stop.y,5,0xe3c888,.9).setDepth(-40);
    });
    for(const d of LAKE_DOCKS.slice(1))this.add.text(d.foot.x+45,d.foot.y,'Bến thuyền ↙',{fontSize:'10px',color:'#fff0c7',backgroundColor:'#264c41',padding:{x:5,y:4}}).setDepth(12000);
    this.npcs.push(new NPC(this,{id:'npc_ngu_ong',name:'Lão Ngư',role:'Người dẫn chuyện hư cấu',avatar:'🛶',x:380,y:1175,textureKey:'npc_fisherman_sheet',startDialogueId:'ngu_ong_intro'}));
    this.npcs.push(new NPC(this,{id:'npc_lake_an',name:'Cô An',role:'Người bán hàng hư cấu',avatar:'🍵',x:795,y:1400,textureKey:'npc_picker_sheet',startDialogueId:'ngu_ong_intro'}));
    this.sunsetTint=this.add.rectangle(0,0,960,540,0xf3a455,0).setOrigin(0).setScrollFactor(0).setDepth(13000);
  }

  private landmark(key: string,x: number,y: number,scale: number,solid: boolean) {
    const image=this.add.image(x,y,key).setOrigin(.5,1).setScale(scale).setDepth(y);
    if(solid)this.obstacles.push(new Phaser.Geom.Rectangle(x-image.displayWidth*.38,y-image.displayHeight*.65,image.displayWidth*.76,image.displayHeight*.6));
  }
  private walkable(x: number,y: number) {
    return x>16&&y>24&&x<LAKE_SIZE.width-16&&y<LAKE_SIZE.height-16&&isLakeLand(x,y)&&!this.obstacles.some(r=>r.contains(x,y));
  }
  private areaDock(x: number,y: number): DockId {
    const nuiCai=LAKE_ISLANDS.find(island=>island.id==='nui_cai')!;
    const birds=LAKE_ISLANDS.find(island=>island.id==='birds')!;
    if(pointInPolygon(x,y,nuiCai.vertices)||(x>=1475&&x<=1525&&y>=530&&y<=630))return 'island';
    if(pointInPolygon(x,y,birds.vertices)||(x>=1705&&x<=1755&&y>=925&&y<=1010))return 'birds';return 'shore';
  }
  private objective() {
    return nextLakeObjective(this.journey.activities)?.text || 'Đã hoàn thành chương · tiếp tục khám phá 12 điểm dừng, tạo nhạc nước hoặc xem lại cảnh kết.';
  }
  private save() {
    if(!this.player||!this.journey)return;
    persistRegionCheckpoint('ho_nui_coc',{...this.lastSafe,dir:this.player.getDirection()},this.currentDock);
  }
  private navigate(id: LakeStopId,fast=false) {
    const stop=LAKE_STOPS.find(s=>s.id===id)!;
    if(id==='dock'&&this.currentDock!=='shore'&&!fast){
      const dock=LAKE_DOCKS.find(d=>d.id===this.currentDock)!;
      this.waypoint='dock';this.waypointRing.setPosition(dock.foot.x,dock.foot.y).setVisible(true);return;
    }
    if(fast&&this.journey.progress.visitedStops.includes(id)){
      this.boating=false;this.route=[];this.cruiseTarget=undefined;this.player.setVisible(true);this.boat.setVisible(false);
      this.player.setPosition(stop.x,stop.y);this.player.body?.updateFromGameObject();this.lastSafe={x:stop.x,y:stop.y};this.currentDock=stop.area;
      this.cameras.main.startFollow(this.player,true,.12,.12);this.cameras.main.setZoom(1.15);this.resetInput();this.save();
    }
    this.waypoint=id;this.waypointRing.setPosition(stop.x,stop.y).setVisible(true);
    if(stop.area!=='shore'&&this.currentDock!==stop.area&&!this.boating)UIManager.getInstance().showToast('Điểm này nằm trên đảo. Hãy đến Bến du thuyền để lên thuyền hoặc chọn đi cùng người lái.');
  }
  private interact(id: LakeStopId) {
    if(this.boating)return;this.resetInput();this.save();AudioManager.getInstance().playClick();this.experience.open(id);
  }
  private nearestDock() {
    const p=this.boating?this.boat:this.player;
    return [...LAKE_DOCKS].sort((a,b)=>Math.hypot(p.x-a.water.x,p.y-a.water.y)-Math.hypot(p.x-b.water.x,p.y-b.water.y))[0];
  }
  private board() {
    if(!this.journey.has('boat_ready')){UIManager.getInstance().showToast('Hãy chuẩn bị chuyến đi tại Bến du thuyền trước.');return;}
    const dock=LAKE_DOCKS.find(d=>d.id===this.currentDock)!;
    if(Math.hypot(this.player.x-dock.foot.x,this.player.y-dock.foot.y)>145){UIManager.getInstance().showToast('Hãy đến gần cầu bến để lên thuyền.');return;}
    this.save();this.resetInput();this.boating=true;this.player.setControlActive(false);this.player.setVisible(false);
    this.boat.setPosition(dock.water.x,dock.water.y).setVisible(true);this.lastBoat={...dock.water};
    this.cameras.main.startFollow(this.boat,true,.09,.09);this.cameras.main.setZoom(.95);
  }
  private cruise(target: DockId) {
    if(!this.boating)this.board();if(!this.boating)return;
    this.cruiseTarget=target;
    this.route=[{x:1100,y:900},...(target==='birds'?[{x:1300,y:850},{x:1650,y:850}]:[]),{...LAKE_DOCKS.find(d=>d.id===target)!.water}];
    this.resetInput();UIManager.getInstance().showToast('Người lái đang đưa bạn tới '+LAKE_DOCKS.find(d=>d.id===target)!.name+'. Có thể hủy dẫn đường để tự lái.');
  }
  private disembark() {
    const dock=this.nearestDock();
    if(Math.hypot(this.boat.x-dock.water.x,this.boat.y-dock.water.y)>100){UIManager.getInstance().showToast('Đến gần bến có cầu gỗ để cập bến.');return;}
    this.boating=false;this.route=[];this.cruiseTarget=undefined;this.currentDock=dock.id;
    this.player.setPosition(dock.foot.x,dock.foot.y).setVisible(true);this.player.body?.updateFromGameObject();this.lastSafe={...dock.foot};
    this.cameras.main.startFollow(this.player,true,.12,.12);this.cameras.main.setZoom(1.15);this.resetInput();this.save();
    this.waypoint=dock.id==='island'?'island':dock.id==='birds'?'birds':'dock';
  }
  private triggerInteraction() {
    const ui=UIManager.getInstance();if(ui.isAnyModalOpen()||ui.isDialogueOpen())return;
    if(this.boating){this.disembark();return;}
    const dock=LAKE_DOCKS.find(d=>d.id===this.currentDock)!;
    if(this.currentDock!=='shore'&&Math.hypot(this.player.x-dock.foot.x,this.player.y-dock.foot.y)<75){this.board();return;}
    if(this.nearby)this.interact(this.nearby);
  }
  private resetInput() {this.touchVector={x:0,y:0};this.player?.setVirtualMovement(0,0);this.player?.setVelocity(0,0);}
  private bindTouch() {
    this.touch?.abort();this.touch=new AbortController();const signal=this.touch.signal;
    document.querySelectorAll<HTMLButtonElement>('.dpad-btn').forEach(btn=>{
      btn.addEventListener('pointerdown',event=>{if(UIManager.getInstance().isAnyModalOpen())return;event.preventDefault();btn.setPointerCapture(event.pointerId);const d=btn.dataset.dir;this.touchVector={x:d==='left'?-1:d==='right'?1:0,y:d==='up'?-1:d==='down'?1:0};this.player.setVirtualMovement(this.touchVector.x,this.touchVector.y);},{signal});
      for(const event of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(event,()=>this.resetInput(),{signal});
    });
    document.getElementById('btn-touch-interact')?.addEventListener('click',()=>this.triggerInteraction(),{signal});
    window.addEventListener('blur',()=>this.resetInput(),{signal});
  }
  private createToolbar() {
    this.toolbar=document.createElement('div');this.toolbar.className='lake-world-toolbar';
    this.toolbar.innerHTML='<span class="lake-travel-status">Đi bộ ven hồ</span><button data-action="map">Bản đồ hồ</button><button data-action="next">Việc tiếp theo</button><button data-action="island">Đi cùng người lái → Núi Cái</button><button data-action="birds">→ Quan sát chim</button><button data-action="shore">→ Về bờ</button><button data-action="cancel">Tự lái</button>';
    document.getElementById('ui-overlay')!.append(this.toolbar);
    this.toolbar.querySelectorAll<HTMLButtonElement>('button').forEach(btn=>btn.onclick=()=>{
      const action=btn.dataset.action;
      if(action==='map')this.guide.open();
      else if(action==='next'){
        const order: LakeStopId[]=['arrival','dock','history','island','birds','palace','sunset'];
        const objective=nextLakeObjective(this.journey.activities);const i=objective?['obj_meet_boatman','obj_prepare_boat','obj_lake_history','obj_nui_cai','obj_bird_observation','obj_legend_puzzle','obj_lake_reflection'].indexOf(objective.id):6;this.navigate(order[i]);
      } else if(action==='cancel'){this.route=[];this.cruiseTarget=undefined;}else this.cruise(action as DockId);
    });
  }

  update(time: number,delta: number) {
    if(!this.player)return;
    const ui=UIManager.getInstance();const blocked=ui.isAnyModalOpen()||ui.isDialogueOpen();
    this.toolbar.hidden=blocked;this.player.setControlActive(!blocked&&!this.boating);
    if(blocked)this.resetInput();
    if(!this.boating){
      if(!this.walkable(this.player.x,this.player.y)){this.player.setPosition(this.lastSafe.x,this.lastSafe.y);this.player.body?.updateFromGameObject();this.player.setVelocity(0,0);}else this.lastSafe={x:this.player.x,y:this.player.y};
      this.player.update(time,delta);
      const closest=[...LAKE_STOPS].sort((a,b)=>Math.hypot(a.x-this.player.x,a.y-this.player.y)-Math.hypot(b.x-this.player.x,b.y-this.player.y))[0];
      this.nearby=Math.hypot(closest.x-this.player.x,closest.y-this.player.y)<85?closest.id:null;
      const dock=LAKE_DOCKS.find(d=>d.id===this.currentDock)!;
      if(!blocked&&this.currentDock!=='shore'&&Math.hypot(this.player.x-dock.foot.x,this.player.y-dock.foot.y)<75)ui.showPrompt('E / Tương tác · Lên thuyền về bờ hoặc sang bến khác');
      else if(!blocked&&this.nearby)ui.showPrompt('E / Tương tác · '+closest.name);else ui.hidePrompt();
    } else if(!blocked) {
      let vx=(this.keys?.RIGHT?.isDown||this.keys?.D?.isDown?1:0)-(this.keys?.LEFT?.isDown||this.keys?.A?.isDown?1:0);
      let vy=(this.keys?.DOWN?.isDown||this.keys?.S?.isDown?1:0)-(this.keys?.UP?.isDown||this.keys?.W?.isDown?1:0);
      if(this.touchVector.x||this.touchVector.y){vx=this.touchVector.x;vy=this.touchVector.y;}
      const next=this.route[0];
      if(next){const distance=Math.hypot(next.x-this.boat.x,next.y-this.boat.y);if(distance<12){this.route.shift();if(!this.route.length){this.disembark();return;}}else{vx=(next.x-this.boat.x)/distance;vy=(next.y-this.boat.y)/distance;}}
      const length=Math.hypot(vx,vy);if(length>1){vx/=length;vy/=length;}
      const step=Math.min(delta,45)/1000*(next?235:200);const x=this.boat.x+vx*step,y=this.boat.y+vy*step;
      if(x>28&&x<2372&&y>28&&y<1572&&!isLakeLand(x,y)){this.boat.setPosition(x,y);this.lastBoat={x,y};if(vx)this.boat.setFlipX(vx<0);}else if(next){this.route=[];this.cruiseTarget=undefined;ui.showToast('Tuyến đã dừng ở gần bờ. Hãy tự lái ra khoảng nước trống hoặc chọn lại bến.');}
      this.boat.setDepth(this.boat.y);
      const dock=this.nearestDock();const near=Math.hypot(this.boat.x-dock.water.x,this.boat.y-dock.water.y)<100;
      ui.showPrompt(near?'E / Tương tác · Cập bến '+dock.name:'Du thuyền · phím hướng / nút di chuyển · chọn bến ở thanh dưới');
    }
    this.npcs.forEach(npc=>npc.setPlayerNearby(!this.boating&&!blocked&&Math.hypot(this.player.x-npc.x,this.player.y-npc.y)<75));
    const p=this.boating?this.boat:this.player;this.guide.update(p.x,p.y,this.boating);
    const target=this.waypoint&&LAKE_STOPS.find(s=>s.id===this.waypoint);
    if(target&&!blocked){
      let x=target.x,y=target.y,name=target.name;
      if(target.id==='dock'&&this.currentDock!=='shore'&&!this.boating){const dock=LAKE_DOCKS.find(d=>d.id===this.currentDock)!;x=dock.foot.x;y=dock.foot.y;name='Cầu bến · lên thuyền';}
      this.waypointRing.setPosition(x,y).setVisible(true);
      const d=Math.hypot(x-p.x,y-p.y);const dx=x-p.x,dy=y-p.y;
      const arrow=d<70?'●':Math.abs(dx)>Math.abs(dy)?dx>0?'→':'←':dy>0?'↓':'↑';
      this.waypointText.setPosition(p.x,p.y-55).setText(`${arrow} ${name}${d<70?' · E / Tương tác':''}`).setVisible(true);
    }else{this.waypointText.setVisible(false);this.waypointRing.setVisible(false);}
    const status=this.toolbar.querySelector('.lake-travel-status')!;status.textContent=this.boating?(this.cruiseTarget?'Đang đi cùng người lái':'Đang tự lái thuyền'):'Đi bộ · '+(this.nearby?LAKE_STOPS.find(s=>s.id===this.nearby)!.name:'ven hồ');
      this.toolbar.querySelectorAll<HTMLElement>('[data-action="island"],[data-action="birds"],[data-action="shore"],[data-action="cancel"]').forEach(el=>el.hidden=!this.boating);
    if(!this.reducedMotion)this.fountainJets.forEach((jet,i)=>jet.height=20+Math.sin(time/700+i*.55)*13+(i%3)*9);
    if(time>this.saveAt){this.saveAt=time+5000;this.save();}
  }
}
