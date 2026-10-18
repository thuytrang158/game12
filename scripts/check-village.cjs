const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});
 try {
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.**/*',r=>r.abort());
  await page.goto(process.env.GAME_URL || 'http://127.0.0.1:3000',{waitUntil:'domcontentloaded',timeout:60000});
  const active=key=>page.waitForFunction(key=>window.__THAI_NGUYEN_QUEST__?.game.scene.isActive(key),key,{timeout:60000});
  const settle=key=>page.waitForFunction(key=>!window.__THAI_NGUYEN_QUEST__.game.scene.getScene(key).cameras.main.fadeEffect.isRunning,key,{timeout:60000});
  const key=async k=>{await page.keyboard.down(k);await page.waitForTimeout(250);await page.keyboard.up(k)};
  await active('MainMenuScene');
  await page.evaluate(()=>window.__THAI_NGUYEN_QUEST__.game.scene.getScene('MainMenuScene').startNewGame());
  await active('TanCuongScene');await settle('TanCuongScene');
  await page.screenshot({path:'artifacts/village/01-village.png'});
  await page.getByRole('button',{name:'Khám phá 6 điểm đến'}).click();
  await page.screenshot({path:'artifacts/village/02-guide.png'});
  await page.getByRole('button',{name:'Đến cửa nhà sao'}).click();
  await page.waitForFunction(()=>window.__THAI_NGUYEN_QUEST__.game.scene.getScene('TanCuongScene').nearestInteractable?.type==='workshop');
  await key('e');await active('TeaHouseScene');await settle('TeaHouseScene');
  assert.equal(await page.locator('.village-guide').isVisible(),false);
  await page.screenshot({path:'artifacts/village/03-workshop.png'});
  // Exercise real Phaser proximity and keyboard, then DOM station controls.
  await page.evaluate(()=>window.__THAI_NGUYEN_QUEST__.game.scene.getScene('TeaHouseScene').player.setPosition(235,270));
  await page.waitForFunction(()=>window.__THAI_NGUYEN_QUEST__.game.scene.getScene('TeaHouseScene').nearest===0);
  await key('e');
  for(let i=0;i<3;i++)await page.getByRole('button',{name:'Rải một lớp búp'}).click();
  assert.equal(await page.getByRole('button',{name:'✓ Đã trải nghiệm'}).isDisabled(),true);
  await page.screenshot({path:'artifacts/village/04-tool.png'});
  await page.keyboard.press('Escape');
  await page.evaluate(()=>window.__THAI_NGUYEN_QUEST__.game.scene.getScene('TeaHouseScene').player.setPosition(480,265));
  await page.waitForFunction(()=>window.__THAI_NGUYEN_QUEST__.game.scene.getScene('TeaHouseScene').nearest===1);
  await key('e');
  assert.equal(await page.getByRole('button',{name:'Bắt đầu sao chè'}).isDisabled(),true);
  await page.keyboard.press('Escape');
  // Seed only the prerequisite using the real quest system, then test processing lifecycle.
  await page.evaluate(async()=>{
   const {QuestManager}=await import('/src/systems/QuestManager.ts');
   QuestManager.getInstance().completeObjective('quest_tan_cuong','obj_harvest_tea');
  });
  await key('e');await page.getByRole('button',{name:'Bắt đầu sao chè'}).click();
  await page.evaluate(()=>window.processingUnderTest=window.__THAI_NGUYEN_QUEST__.UIManager.activeMinigame);
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>window.processingUnderTest.stageComplete),true);
  await key('e');await page.getByRole('button',{name:'Bắt đầu sao chè'}).click();
  await page.evaluate(()=>{const game=window.__THAI_NGUYEN_QUEST__.UIManager.activeMinigame;for(let i=0;i<3;i++)game.updatePhysics(30)});
  await page.locator('#btn-process-finish').click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('thai_nguyen_quest_save_v1')).quests.quest_tan_cuong.objectives.find(o=>o.id==='obj_process_tea').completed),true);
  await page.getByRole('button',{name:'Trở về làng chè'}).click();await active('TanCuongScene');
  assert.equal(await page.locator('.village-guide').count(),1);
  assert.equal(await page.locator('.tea-house-exit').count(),0);
  for(const stop of ['garden','nursery','pavilion','culture','river']) {
   await page.getByRole('button',{name:'Khám phá 6 điểm đến'}).click();
   await page.locator(`[data-stop="${stop}"]`).click();
   await page.waitForFunction(id=>JSON.parse(localStorage.getItem('thai_nguyen_quest_save_v1')).passportStamps['village_'+id],stop);
  }
  assert.equal(await page.locator('.guide-progress b').textContent(),'6/6');
  await page.reload({waitUntil:'domcontentloaded'});await active('MainMenuScene');
  await page.evaluate(()=>window.__THAI_NGUYEN_QUEST__.game.scene.getScene('MainMenuScene').continueGame());await active('TanCuongScene');await settle('TanCuongScene');
  await page.waitForFunction(()=>document.querySelector('.guide-progress b')?.textContent==='6/6');
  // Narrow viewport and modal scrolling.
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'artifacts/village/05-mobile.png'});
  await page.getByRole('button',{name:'Khám phá 6 điểm đến'}).click();
  await page.screenshot({path:'artifacts/village/06-mobile-guide.png'});
  assert.equal(await page.evaluate(()=>{const r=document.querySelector('.village-exhibit').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}),true);
  await page.getByRole('button',{name:'Đến cửa nhà sao'}).click();
  await page.waitForFunction(()=>window.__THAI_NGUYEN_QUEST__.game.scene.getScene('TanCuongScene').nearestInteractable?.type==='workshop');
  await page.locator('#btn-touch-interact').dispatchEvent('click');await active('TeaHouseScene');await settle('TeaHouseScene');
  await page.screenshot({path:'artifacts/village/07-mobile-workshop.png'});
  await page.getByRole('button',{name:'Trở về làng chè'}).click();await active('TanCuongScene');
  assert.deepEqual(errors,[]);
  console.log('PASS: entry, interior, station actions, quest gate, minigame cancellation/completion, return, six stamps, save reload, mobile bounds and touch entry; no runtime errors.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
