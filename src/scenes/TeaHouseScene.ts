import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { UIManager } from '../ui/UIManager';
import { QuestManager } from '../systems/QuestManager';
import { stampVisit } from '../ui/VillageGuide';

const STATIONS = [
  { id: 'trays', x: 235, y: 215, icon: '🧺', name: 'Nia tre · Rải búp', texture: 'tea_drying_tray', description: 'Búp chè tươi được nhặt bỏ tạp chất và rải trên nia sạch. Lớp lá thoáng giúp nguyên liệu không bị dồn nóng trước khi chế biến.', task: 'Rải búp thành lớp mỏng', done: 'Búp chè đã được rải thoáng trên nia.', verb: 'Rải một lớp búp', total: 3 },
  { id: 'wok', x: 480, y: 210, icon: '🔥', name: 'Chảo sao · Diệt men', texture: '', description: 'Chảo sao truyền nhiệt cho lá chè. Người làm chè phải quan sát và đảo đều để lá được xử lý đồng đều. Thử thách trong game là mô phỏng, không phải hướng dẫn nhiệt độ sản xuất.', task: 'Thực hành với mẻ chè đã thu hái', done: '', verb: 'Bắt đầu sao chè', total: 0 },
  { id: 'rolling', x: 725, y: 215, icon: '🍃', name: 'Bàn vò · Tạo hình', texture: 'tea_drying_tray', description: 'Vò giúp lá chè cuộn lại và tạo hình cánh trà. Nhịp tay và lực vò cần phù hợp với nguyên liệu; không phải cứ dùng nhiều lực là tốt.', task: 'Thử nhịp vò nhẹ và đều', done: 'Cánh chè đã cuộn lại. Tiếp theo cần làm khô.', verb: 'Vò một nhịp', total: 5 },
  { id: 'sieve', x: 235, y: 365, icon: '🪵', name: 'Sàng tre · Phân loại', texture: 'tea_drying_tray', description: 'Sau công đoạn làm khô, sàng giúp phân loại cánh chè và tách phần vụn. Chè được để nguội phù hợp trước khi đóng gói.', task: 'Sàng nhẹ để phân loại cánh chè', done: 'Cánh chè và phần vụn đã được phân loại.', verb: 'Sàng một lượt', total: 3 },
  { id: 'tea', x: 725, y: 365, icon: '🍵', name: 'Bàn trà · Cảm nhận', texture: 'water_jar_prop', description: 'Ngắm màu nước, cảm nhận hương rồi nhấp một ngụm nhỏ. Bạn có thể ghi nhớ cảm nhận của riêng mình; mỗi mẻ trà có sắc thái khác nhau.', task: 'Chọn điều bạn muốn cảm nhận trước', done: 'Đã ghi vào sổ trải nghiệm. Hãy ra hiên trà để ngắm nương xanh.', verb: '', total: 1 }
];

export class TeaHouseScene extends Phaser.Scene {
  private player!: Player;
  private interact!: Phaser.Input.Keyboard.Key;

  private nearest = -1;
  private controls?: AbortController;
  private exitButton?: HTMLButtonElement;
  private onReturn?: () => void;
  private practice?: () => void;
  private leaving = false;
  constructor() { super('TeaHouseScene'); }
  create(data: { onReturn: () => void; practice: () => void }) {
    this.onReturn = data.onReturn;
    this.practice = data.practice;
    this.leaving = false;
    this.nearest = -1;
    const ui = UIManager.getInstance();
    ui.setRegionName('Bên trong nhà sao chè');
    ui.hidePrompt();
    this.cameras.main.setBackgroundColor('#182a23');
    this.cameras.main.fadeIn(350);
    const g = this.add.graphics();
    g.fillStyle(0x392e27); g.fillRoundedRect(110, 105, 740, 375, 12);
    g.fillStyle(0x98704b); g.fillRect(130, 155, 700, 300);
    for(let y=155;y<450;y+=25) {
      g.lineStyle(1,0x62462f,0.5); g.lineBetween(130,y,830,y);
      for(let x=130+(y%2)*35;x<830;x+=90) g.lineBetween(x,y,x,y+25);
    }
    g.fillStyle(0x5c3d2d); g.fillRect(110,105,740,60);
    for (const x of [140,820]) {g.fillStyle(0x422c22);g.fillRect(x,155,16,290);g.fillStyle(0x94683e);g.fillRect(x+3,155,4,290);}
    for (const x of [270,650]) {
      g.fillStyle(0xc0d6a1);g.fillRect(x,117,70,36);
      g.lineStyle(3,0x6a492f);g.lineBetween(x+35,117,x+35,153);g.lineBetween(x,135,x+70,135);
    }
    // Rafters, hanging baskets and a woven runner frame the workshop floor.
    g.fillStyle(0x392b22);g.fillRect(110,102,740,9);
    for(const x of [185,385,585,785]) {g.fillStyle(0x715035);g.fillRect(x,110,6,44);}
    g.fillStyle(0xb5a173,.32);g.fillRect(425,255,110,170);
    g.lineStyle(2,0xe1c38b,.35);
    for(let y=260;y<425;y+=10)g.lineBetween(430,y,530,y);
    for(const x of [170,790]) {
      this.add.image(x,185,'tea_basket_prop').setScale(1.4).setDepth(180);
      this.add.image(x,420,'tea_basket_prop').setScale(1.6).setDepth(425);
    }
    this.add.text(480,175,'RẢI BÚP  →  SAO  →  VÒ  →  LÀM KHÔ  →  THƯỞNG TRÀ', {fontSize:'9px',fontFamily:'sans-serif',color:'#e5c691'}).setOrigin(.5).setDepth(500);
    g.fillStyle(0xc0a477);g.fillRoundedRect(425,430,110,60,7);
    this.add.text(480,130,'NHÀ SAO CHÈ · TÂN CƯƠNG',{fontFamily:'sans-serif',fontSize:'17px',color:'#f7dfab',fontStyle:'bold'}).setOrigin(.5);
    this.add.text(480,478,'↓ RA VƯỜN',{fontSize:'12px',color:'#ffdf9d'}).setOrigin(.5);
    const obstacles = this.physics.add.staticGroup();
    for(const [x,y,w,h] of [[120,300,20,310],[840,300,20,310],[480,160,700,12],[275,454,290,12],[685,454,290,12]]) {
      const wall=this.add.rectangle(x,y,w,h,0x30261e,0);
      this.physics.add.existing(wall,true);obstacles.add(wall);
    }
    STATIONS.forEach((s,i)=>{
      this.add.ellipse(s.x,s.y+15,105,24,0x30241d,.3);
      this.add.rectangle(s.x,s.y+7,88,40,0x533b29).setDepth(s.y);
      this.add.rectangle(s.x,s.y-5,100,30,0xba8c50).setDepth(s.y+1);
      if(s.texture) this.add.image(s.x,s.y-12,s.texture).setScale(1.6).setDepth(s.y+2);
      else {
        this.add.ellipse(s.x,s.y-7,75,30,0x242a2c).setStrokeStyle(4,0x758071).setDepth(s.y+2);
        const fire=this.add.ellipse(s.x,s.y+18,36,14,0xf5a541).setDepth(s.y+3);
        this.tweens.add({targets:fire,alpha:.45,scaleX:.75,duration:450,yoyo:true,repeat:-1});
        this.add.particles(s.x,s.y-15,'leaf_particle',{lifespan:1500,speedY:{min:-20,max:-35},speedX:{min:-5,max:5},tint:0xf6e6cc,alpha:{start:.35,end:0},scale:{start:.6,end:1.5},frequency:200}).setDepth(230);
      }
      if(s.id==='tea') {
        const set=this.add.graphics().setDepth(s.y+3);
        set.fillStyle(0xf2e5c0);
        set.fillEllipse(s.x-15,s.y-12,24,17);
        set.fillRoundedRect(s.x-22,s.y-26,16,15,4);
        set.fillRect(s.x-18,s.y-30,9,4);
        set.lineStyle(3,0xf2e5c0);set.strokeCircle(s.x-27,s.y-20,6);
        set.fillTriangle(s.x-8,s.y-23,s.x+5,s.y-27,s.x-6,s.y-14);
        for(const x of [s.x+17,s.x+31]) {set.fillEllipse(x,s.y-5,12,8);set.fillStyle(0xc8ad59);set.fillEllipse(x,s.y-7,8,4);set.fillStyle(0xf2e5c0);}
      }
      if(s.id==='rolling') {
        this.add.rectangle(s.x+27,s.y-12,12,18,0x4e7843).setAngle(30).setDepth(s.y+3);
        this.add.rectangle(s.x+35,s.y-10,6,13,0x385e32).setAngle(45).setDepth(s.y+3);
      }
      const label=this.add.text(s.x,s.y-48,`${i+1}. ${s.name}`,{fontSize:'12px',fontFamily:'sans-serif',color:'#ffedbc',backgroundColor:'#253e30',padding:{x:8,y:5}}).setOrigin(.5).setDepth(500).setInteractive({useHandCursor:true});
      label.on('pointerdown',()=>{
        if(ui.isAnyModalOpen()||ui.isDialogueOpen()) return;
        if(Phaser.Math.Distance.Between(this.player.x,this.player.y,s.x,s.y)>100) {ui.showToast('Tiến lại gần bàn dụng cụ để khám phá nhé.');return;}
        this.openStation(i);
      });
      const collider=this.add.rectangle(s.x,s.y,100,30);
      this.physics.add.existing(collider,true);obstacles.add(collider);
    });
    this.player=new Player(this,480,400);
    this.physics.world.setBounds(120,165,720,325);
    this.physics.add.collider(this.player,obstacles);
    this.interact=this.input.keyboard!.addKey('E');

    this.controls=new AbortController();
    const signal=this.controls.signal;
    document.querySelectorAll<HTMLButtonElement>('.dpad-btn').forEach(btn=>{
      btn.addEventListener('pointerdown',e=>{
        e.preventDefault();btn.setPointerCapture(e.pointerId);
        const dir=btn.dataset.dir;this.player.setVirtualMovement(dir==='left'?-1:dir==='right'?1:0,dir==='up'?-1:dir==='down'?1:0);
      },{signal});
      for(const evt of ['pointerup','pointercancel','lostpointercapture']) btn.addEventListener(evt,()=>this.player.setVirtualMovement(0,0),{signal});
    });
    document.getElementById('btn-touch-interact')?.addEventListener('click',()=>this.act(),{signal});
    this.exitButton=document.createElement('button');this.exitButton.className='tea-house-exit';this.exitButton.textContent='← Trở về làng chè';
    this.exitButton.onclick=()=>{if(!ui.isAnyModalOpen()&&!ui.isDialogueOpen())this.leave();};document.getElementById('ui-overlay')!.append(this.exitButton);
    ui.setOnTravelCallback(()=>ui.showToast('Hãy trở về làng chè trước khi di chuyển sang vùng khác.'));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.controls?.abort();this.exitButton?.remove();ui.hidePrompt();});
  }
  update(time:number,delta:number) {
    const ui=UIManager.getInstance();const blocked=ui.isAnyModalOpen()||ui.isDialogueOpen();
    this.player.setControlActive(!blocked&&!this.leaving);this.player.update(time,delta);
    this.exitButton?.classList.toggle('hidden',blocked);
    if(blocked){ui.hidePrompt();return;}
    this.nearest=STATIONS.findIndex(s=>Math.hypot(s.x-this.player.x,s.y-this.player.y)<88);
    if(this.player.y>430&&Math.abs(this.player.x-480)<65)ui.showPrompt('Nhấn E để trở về làng chè');
    else if(this.nearest>=0)ui.showPrompt(`Nhấn E · ${STATIONS[this.nearest].name}`);
    else ui.showPrompt('Đi đến từng bàn dụng cụ · E khám phá · cửa ra ở phía dưới');
    if(Phaser.Input.Keyboard.JustDown(this.interact))this.act();
    // ESC closes DOM modals via UIManager; exiting uses the explicit door/button.
  }
  private act(){
    const ui=UIManager.getInstance();if(ui.isAnyModalOpen()||ui.isDialogueOpen())return;
    if(this.player.y>430&&Math.abs(this.player.x-480)<65)this.leave();
    else if(this.nearest>=0)this.openStation(this.nearest);
  }
  private openStation(index:number){
    const s=STATIONS[index];const ui=UIManager.getInstance();
    const body=ui.openExhibit(s.name,'XƯỞNG TRÀ · CHẠM VÀO CÂU CHUYỆN CỦA TỪNG DỤNG CỤ');
    body.innerHTML=`<div class="station-hero"><div class="station-art ${s.id}"><span>${s.icon}</span><i></i><i></i><i></i></div><div><small>TRẠM ${index+1} / 5</small><h3>${s.name}</h3><p>${s.description}</p></div></div><div class="station-activity"><h4>${s.task}</h4><p class="station-status" aria-live="polite">Tham quan tự do · thao tác mô phỏng</p><progress max="${s.total||1}" value="0"></progress><div class="station-actions"></div></div><p class="trail-note">Khám phá dụng cụ không thay thế nhiệm vụ sao chè của Bác Lâm.</p>`;
    const actions=body.querySelector('.station-actions')!;const status=body.querySelector('.station-status')!;const progress=body.querySelector('progress')!;
    const complete=()=>{stampVisit('tool_'+s.id);status.textContent=s.done;progress.value=s.total;};
    if(s.id==='tea'){
      for(const flavor of ['Ngắm màu nước','Cảm nhận hương','Nhấp một ngụm']){const btn=document.createElement('button');btn.textContent=flavor;btn.onclick=()=>{complete();status.textContent=`${flavor} · ${s.done}`;};actions.append(btn);}
    }else{
      const btn=document.createElement('button');btn.textContent=s.verb;actions.append(btn);
      if(s.id==='wok'){
        const quest=QuestManager.getInstance().getQuest('quest_tan_cuong');
        const ready=quest?.objectives.some(o=>o.id==='obj_harvest_tea'&&o.completed)||quest?.status==='completed';
        btn.disabled=!ready;
        status.textContent=ready?'Mẻ chè đã sẵn sàng. Cùng thử điều chỉnh nhịp đảo chè!':'Bạn vẫn có thể tham quan. Để sao chè: gặp Bác Lâm, chuẩn bị vật tư và hoàn thành hái chè trước.';
        btn.onclick=()=>{ui.closeAllModals();this.practice?.();};
      }else{
        let count=0;btn.onclick=()=>{count++;progress.value=count;body.querySelector('.station-art')?.classList.toggle('working');status.textContent=`${count}/${s.total} · ${s.task}`;if(count>=s.total){complete();btn.disabled=true;btn.textContent='✓ Đã trải nghiệm';}};
      }
    }
  }
  private leave(){if(this.leaving)return;this.leaving=true;UIManager.getInstance().closeAllModals();this.scene.stop();this.scene.resume('TanCuongScene');this.onReturn?.();}
}
