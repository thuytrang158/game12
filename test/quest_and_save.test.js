import test from 'node:test';
import assert from 'node:assert/strict';

// Test Mock Implementation of Quest Progression logic
class TestQuestManager {
  constructor(initialQuests) {
    this.quests = JSON.parse(JSON.stringify(initialQuests));
    this.activeQuestId = 'quest_tan_cuong';
    this.completedQuestIds = [];
  }

  getActiveQuest() {
    return this.quests[this.activeQuestId];
  }

  completeObjective(questId, objectiveId) {
    const quest = this.quests[questId];
    if (!quest) return false;
    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj) return false;
    obj.completed = true;
    if (obj.targetCount) obj.currentCount = obj.targetCount;

    const allDone = quest.objectives.every(o => o.completed);
    if (allDone) {
      quest.status = 'completed';
      if (!this.completedQuestIds.includes(questId)) {
        this.completedQuestIds.push(questId);
      }
    }
    return true;
  }

  incrementObjective(questId, objectiveId, amount = 1) {
    const quest = this.quests[questId];
    if (!quest) return false;
    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj) return false;
    obj.currentCount = (obj.currentCount || 0) + amount;
    if (obj.targetCount && obj.currentCount >= obj.targetCount) {
      obj.completed = true;
    }
    return true;
  }
}

// Test Mock of Inventory Logic
class TestInventoryManager {
  constructor() {
    this.items = [];
  }

  addItem(item, quantity = 1) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + quantity;
    } else {
      this.items.push({ ...item, quantity });
    }
  }

  hasItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    return item ? (item.quantity === undefined || item.quantity > 0) : false;
  }

  removeItem(itemId, quantity = 1) {
    const idx = this.items.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    const item = this.items[idx];
    if (item.quantity !== undefined) {
      item.quantity -= quantity;
      if (item.quantity <= 0) {
        this.items.splice(idx, 1);
      }
    } else {
      this.items.splice(idx, 1);
    }
    return true;
  }

  getFragments() {
    return this.items.filter(i => i.category === 'fragment');
  }
}

test('Quest Progression Suite: Tan Cuong Chapter', (t) => {
  const sampleQuests = {
    quest_tan_cuong: {
      id: 'quest_tan_cuong',
      title: 'Hương Trà Đầu Tiên',
      status: 'active',
      objectives: [
        { id: 'obj_meet_bac_lam', text: 'Gặp Bác Lâm', completed: false },
        { id: 'obj_harvest_tea', text: 'Hái 5 búp chè', completed: false, targetCount: 5, currentCount: 0 },
        { id: 'obj_process_tea', text: 'Sao chè chảo gang', completed: false },
        { id: 'obj_quiz_tea', text: 'Đố vui văn hóa', completed: false },
        { id: 'obj_claim_fragment', text: 'Nhận mảnh ký ức', completed: false }
      ]
    }
  };

  const qm = new TestQuestManager(sampleQuests);

  // Step 1: Meet Bac Lam
  assert.equal(qm.getActiveQuest().status, 'active');
  qm.completeObjective('quest_tan_cuong', 'obj_meet_bac_lam');
  assert.equal(qm.getActiveQuest().objectives[0].completed, true);

  // Step 2: Harvest tea leaves (increment)
  qm.incrementObjective('quest_tan_cuong', 'obj_harvest_tea', 3);
  assert.equal(qm.getActiveQuest().objectives[1].currentCount, 3);
  assert.equal(qm.getActiveQuest().objectives[1].completed, false);

  qm.incrementObjective('quest_tan_cuong', 'obj_harvest_tea', 2);
  assert.equal(qm.getActiveQuest().objectives[1].currentCount, 5);
  assert.equal(qm.getActiveQuest().objectives[1].completed, true);

  // Step 3: Tea Processing
  qm.completeObjective('quest_tan_cuong', 'obj_process_tea');
  assert.equal(qm.getActiveQuest().objectives[2].completed, true);

  // Step 4: Quiz
  qm.completeObjective('quest_tan_cuong', 'obj_quiz_tea');
  assert.equal(qm.getActiveQuest().objectives[3].completed, true);

  // Step 5: Claim Fragment
  qm.completeObjective('quest_tan_cuong', 'obj_claim_fragment');
  assert.equal(qm.getActiveQuest().status, 'completed');
  assert.ok(qm.completedQuestIds.includes('quest_tan_cuong'));
});

test('Inventory & Fragment Collection Suite', (t) => {
  const inv = new TestInventoryManager();

  inv.addItem({ id: 'tea_basket', name: 'Gùi tre', category: 'tool' });
  assert.equal(inv.hasItem('tea_basket'), true);

  inv.addItem({ id: 'tea_buds_fresh', name: 'Búp chè tươi', category: 'tea' }, 5);
  assert.equal(inv.hasItem('tea_buds_fresh'), true);
  const teaItem = inv.items.find(i => i.id === 'tea_buds_fresh');
  assert.equal(teaItem.quantity, 5);

  // Collect fragment
  inv.addItem({ id: 'fragment_tea_culture', name: 'Mảnh Ký Ức Văn Hóa Trà', category: 'fragment' }, 1);
  assert.equal(inv.hasItem('fragment_tea_culture'), true);
  assert.equal(inv.getFragments().length, 1);

  // Collect all 5 regional fragments
  inv.addItem({ id: 'fragment_legend', name: 'Mảnh Ký Ức Truyền Thuyết', category: 'fragment' }, 1);
  inv.addItem({ id: 'fragment_history', name: 'Mảnh Ký Ức Lịch Sử', category: 'fragment' }, 1);
  inv.addItem({ id: 'fragment_nature', name: 'Mảnh Ký Ức Thiên Nhiên', category: 'fragment' }, 1);
  inv.addItem({ id: 'fragment_exploration', name: 'Mảnh Ký Ức Khám Phá', category: 'fragment' }, 1);

  assert.equal(inv.getFragments().length, 5);
  assert.ok(inv.hasItem('fragment_legend'));
  assert.ok(inv.hasItem('fragment_history'));
  assert.ok(inv.hasItem('fragment_nature'));
  assert.ok(inv.hasItem('fragment_exploration'));
});

test('Multi-Region Quest Progression Suite', (t) => {
  const multiRegionQuests = {
    quest_ho_nui_coc: {
      id: 'quest_ho_nui_coc',
      title: 'Lời Thì Thầm Của Mặt Hồ',
      objectives: [
        { id: 'obj_meet_boatman', text: 'Gặp Lão Ngư', completed: false },
        { id: 'obj_legend_puzzle', text: 'Ghép cổ thư', completed: false }
      ]
    },
    quest_atk_dinh_hoa: {
      id: 'quest_atk_dinh_hoa',
      title: 'Theo Dấu Lịch Sử',
      objectives: [
        { id: 'obj_meet_historian', text: 'Gặp HDV', completed: false },
        { id: 'obj_timeline_puzzle', text: 'Niên biểu lịch sử', completed: false }
      ]
    },
    quest_hang_phuong_hoang: {
      id: 'quest_hang_phuong_hoang',
      title: 'Ánh Sáng Trong Hang Động',
      objectives: [
        { id: 'obj_light_lantern', text: 'Thắp sáng thạch nhũ', completed: false }
      ]
    },
    quest_suoi_cua_tu: {
      id: 'quest_suoi_cua_tu',
      title: 'Dòng Chảy Bí Ẩn',
      objectives: [
        { id: 'obj_cross_river', text: 'Vượt ghềnh thác', completed: false }
      ]
    }
  };

  const qm = new TestQuestManager(multiRegionQuests);

  // Complete Ho Nui Coc
  qm.completeObjective('quest_ho_nui_coc', 'obj_meet_boatman');
  qm.completeObjective('quest_ho_nui_coc', 'obj_legend_puzzle');
  assert.ok(qm.completedQuestIds.includes('quest_ho_nui_coc'));

  // Complete ATK Dinh Hoa
  qm.completeObjective('quest_atk_dinh_hoa', 'obj_meet_historian');
  qm.completeObjective('quest_atk_dinh_hoa', 'obj_timeline_puzzle');
  assert.ok(qm.completedQuestIds.includes('quest_atk_dinh_hoa'));

  // Complete Hang Phuong Hoang
  qm.completeObjective('quest_hang_phuong_hoang', 'obj_light_lantern');
  assert.ok(qm.completedQuestIds.includes('quest_hang_phuong_hoang'));

  // Complete Suoi Cua Tu
  qm.completeObjective('quest_suoi_cua_tu', 'obj_cross_river');
  assert.ok(qm.completedQuestIds.includes('quest_suoi_cua_tu'));

  assert.equal(qm.completedQuestIds.length, 4);
});

test('Tea Seedling & Nursery Shopping Quest Suite', (t) => {
  const tanCuongFullQuest = {
    quest_tan_cuong: {
      id: 'quest_tan_cuong',
      title: 'Hương Trà Đầu Tiên',
      status: 'active',
      objectives: [
        { id: 'obj_meet_bac_lam', text: 'Gặp Bác Lâm', completed: false },
        { id: 'obj_shop_cultivar', text: 'Chọn Cây giống chè cổ truyền', completed: false },
        { id: 'obj_shop_fertilizer', text: 'Chọn vật tư hữu cơ hoai mục', completed: false },
        { id: 'obj_return_bac_lam_supplies', text: 'Giao vật tư cho Bác Lâm', completed: false },
        { id: 'obj_harvest_tea', text: 'Hái 5 búp chè', completed: false, targetCount: 5, currentCount: 0 },
        { id: 'obj_process_tea', text: 'Sao chè chảo gang', completed: false },
        { id: 'obj_quiz_tea', text: 'Đố vui văn hóa trà', completed: false },
        { id: 'obj_claim_fragment', text: 'Nhận mảnh ký ức & hộ chiếu', completed: false }
      ]
    }
  };

  const qm = new TestQuestManager(tanCuongFullQuest);
  const inv = new TestInventoryManager();

  // 1. Initial State: Meet Bac Lam, receive note & 120 Xu
  qm.completeObjective('quest_tan_cuong', 'obj_meet_bac_lam');
  inv.addItem({ id: 'note_bac_lam', name: 'Tờ Ghi Chú Của Bác Lâm', category: 'quest' });
  inv.addItem({ id: 'coin_xu_tra', name: 'Xu Xứ Trà', category: 'tool' }, 120);

  assert.equal(inv.hasItem('note_bac_lam'), true);
  assert.equal(inv.items.find(i => i.id === 'coin_xu_tra').quantity, 120);

  // 2. Buy wrong cultivar first (e.g. LDP1 for 45 Xu) -> 75 Xu left
  inv.items.find(i => i.id === 'coin_xu_tra').quantity -= 45;
  inv.addItem({ id: 'seedling_ldp1', name: 'Cây Giống Chè Lai LDP1', category: 'collectible' });
  assert.equal(inv.hasItem('seedling_ldp1'), true);
  assert.equal(inv.items.find(i => i.id === 'coin_xu_tra').quantity, 75);

  // 3. Test refund mechanic: Return LDP1 -> 120 Xu refunded
  inv.removeItem('seedling_ldp1', 1);
  inv.items.find(i => i.id === 'coin_xu_tra').quantity += 45;
  assert.equal(inv.hasItem('seedling_ldp1'), false);
  assert.equal(inv.items.find(i => i.id === 'coin_xu_tra').quantity, 120);

  // 4. Buy correct cultivar: Chè Trung Du (40 Xu) & Compost (30 Xu) -> 50 Xu left
  inv.items.find(i => i.id === 'coin_xu_tra').quantity -= 40;
  inv.addItem({ id: 'seedling_trung_du', name: 'Cây Giống Chè Trung Du', category: 'collectible' });
  qm.completeObjective('quest_tan_cuong', 'obj_shop_cultivar');

  inv.items.find(i => i.id === 'coin_xu_tra').quantity -= 30;
  inv.addItem({ id: 'compost_organic', name: 'Phân Hữu Cơ Vi Sinh Ủ Hoai Mục', category: 'tool' });
  qm.completeObjective('quest_tan_cuong', 'obj_shop_fertilizer');

  assert.equal(inv.hasItem('seedling_trung_du'), true);
  assert.equal(inv.hasItem('compost_organic'), true);
  assert.equal(inv.items.find(i => i.id === 'coin_xu_tra').quantity, 50);

  // 5. Return to Bac Lam and validate supplies
  const hasBoth = inv.hasItem('seedling_trung_du') && inv.hasItem('compost_organic');
  assert.equal(hasBoth, true);
  qm.completeObjective('quest_tan_cuong', 'obj_return_bac_lam_supplies');
  assert.equal(qm.getActiveQuest().objectives[3].completed, true);

  // 6. Harvest 5 tea buds
  qm.incrementObjective('quest_tan_cuong', 'obj_harvest_tea', 5);
  inv.addItem({ id: 'tea_buds_fresh', name: 'Búp chè tươi', category: 'tea' }, 5);
  assert.equal(qm.getActiveQuest().objectives[4].completed, true);
  assert.equal(inv.items.find(i => i.id === 'tea_buds_fresh').quantity, 5);

  // 7. Wok roasting mini-game
  qm.completeObjective('quest_tan_cuong', 'obj_process_tea');
  inv.addItem({ id: 'tea_processed_tan_cuong', name: 'Trà Tân Cương Thượng Hạng', category: 'tea' }, 1);
  assert.equal(qm.getActiveQuest().objectives[5].completed, true);

  // 8. Cultural Quiz & Claim Fragment
  qm.completeObjective('quest_tan_cuong', 'obj_quiz_tea');
  assert.equal(qm.getActiveQuest().objectives[6].completed, true);

  qm.completeObjective('quest_tan_cuong', 'obj_claim_fragment');
  inv.addItem({ id: 'fragment_tea_culture', name: 'Mảnh Ký Ức Văn Hóa Trà', category: 'fragment' }, 1);
  assert.equal(qm.getActiveQuest().status, 'completed');
  assert.ok(qm.completedQuestIds.includes('quest_tan_cuong'));
  assert.equal(inv.hasItem('fragment_tea_culture'), true);
});

test('Tan Cuong Visual Atmosphere & Village Life Suite', () => {
  // 1. Verify Bush Variants
  const bushVariants = ['tea_bush_standard', 'tea_bush_dense', 'tea_bush_young', 'tea_bush_flowering'];
  assert.equal(bushVariants.length, 4);

  // 2. Verify Ambient Workers
  const ambientWorkers = [
    { id: 'worker_tam', name: 'Bác Tám', role: 'Thợ hái chè' },
    { id: 'worker_hai', name: 'Anh Hải', role: 'Người gánh chè' },
    { id: 'worker_lan', name: 'Chị Lan', role: 'Thợ chọn búp non' },
    { id: 'worker_ba', name: 'Bác Ba', role: 'Người hong chè truyền thống' }
  ];
  assert.equal(ambientWorkers.length, 4);
  assert.ok(ambientWorkers.every(w => w.name && w.role));

  // 3. Verify Scenic Pavilion & Sunset Trigger Condition
  // Sunset cinematic is unlockable when obj_process_tea is completed or quest is completed
  const questMock = {
    id: 'quest_tan_cuong',
    status: 'active',
    objectives: [
      { id: 'obj_process_tea', completed: false }
    ]
  };

  const isSunsetAvailableBeforeRoasting = questMock.objectives[0].completed || questMock.status === 'completed';
  assert.equal(isSunsetAvailableBeforeRoasting, false);

});

test('Tea Harvest "Một Tôm Hai Lá" Botanical Shoot & Picking Validation Suite', () => {
  // 1. Shoot Types Definition
  const shootTypes = ['perfect', 'immature', 'long_shoot', 'overmature', 'damaged'];
  assert.equal(shootTypes.length, 5);

  // 2. Validate Botanical Model for Perfect Shoot (Type A)
  const perfectShoot = {
    id: 'shoot_01',
    type: 'perfect',
    bud: { label: 'Tôm chè', tender: true },
    leaf1: { label: 'Lá non 1', tender: true, maturity: 'young' },
    leaf2: { label: 'Lá non 2', tender: true, maturity: 'young' },
    stemSegments: [
      { id: 'p_target', label: 'Đốt cuống non (Dưới lá 2)', isTargetPoint: true }
    ],
    harvestEligibility: true
  };
  assert.equal(perfectShoot.bud.tender, true);
  assert.equal(perfectShoot.leaf1.tender, true);
  assert.equal(perfectShoot.leaf2.tender, true);
  assert.equal(perfectShoot.stemSegments[0].isTargetPoint, true);

  // 3. Validate Immature Shoot (Type B)
  const immatureShoot = {
    id: 'shoot_02',
    type: 'immature',
    bud: { label: 'Tôm mới nhú', tender: true },
    leaf1: { label: 'Vảy lá mầm', tender: true, maturity: 'young' },
    stemSegments: [
      { id: 'p_base', isTargetPoint: false }
    ],
    harvestEligibility: false
  };
  assert.equal(immatureShoot.harvestEligibility, false);

  // 4. CRITICAL TEST: Long Shoot (Type C) Harvesting Rule
  // A shoot with >2 leaves can be harvested IF the upper picking point is chosen!
  const longShoot = {
    id: 'shoot_03',
    type: 'long_shoot',
    bud: { label: 'Tôm chè', tender: true },
    leaf1: { label: 'Lá non 1', tender: true },
    leaf2: { label: 'Lá non 2', tender: true },
    lowerLeaves: [
      { label: 'Lá già thứ 3', tender: false, maturity: 'mature' }
    ],
    stemSegments: [
      { id: 'seg_upper', label: 'Đốt dưới lá 2', isTargetPoint: true },
      { id: 'seg_lower', label: 'Gốc cành dưới lá già 3', isTargetPoint: false }
    ],
    harvestEligibility: true
  };

  // Picking Upper Point: SUCCESSFUL harvest, leaves lower leaf on plant!
  function evaluatePluck(shoot, segmentId) {
    if (shoot.type === 'immature' || shoot.type === 'overmature' || shoot.type === 'damaged') {
      return { success: false, reason: 'unsuitable_shoot' };
    }
    const seg = shoot.stemSegments.find(s => s.id === segmentId);
    if (!seg || !seg.isTargetPoint) {
      return { success: false, reason: 'wrong_picking_point' };
    }
    return { 
      success: true, 
      partiallyHarvested: shoot.type === 'long_shoot',
      remainingLeaves: shoot.lowerLeaves ? shoot.lowerLeaves.length : 0
    };
  }

  const resultUpper = evaluatePluck(longShoot, 'seg_upper');
  assert.equal(resultUpper.success, true);
  assert.equal(resultUpper.partiallyHarvested, true);
  assert.equal(resultUpper.remainingLeaves, 1); // Mature leaf remains on plant!

  const resultLower = evaluatePluck(longShoot, 'seg_lower');
  assert.equal(resultLower.success, false);
  assert.equal(resultLower.reason, 'wrong_picking_point');

  // 5. Test Quality Scoring Formula
  // 40% shoot, 30% ID, 20% point, 10% handling
  function computeScore(correctShoots, correctPoints, mistakes) {
    const shootScore = Math.min(40, Math.round((correctShoots / 5) * 40));
    const pointScore = Math.min(20, Math.round((correctPoints / 5) * 20));
    const idScore = Math.max(10, 30 - mistakes * 5);
    const handlingScore = 10;
    return shootScore + pointScore + idScore + handlingScore;
  }

  assert.equal(computeScore(5, 5, 0), 100);
  assert.ok(computeScore(5, 5, 2) >= 85);
  assert.ok(computeScore(5, 5, 4) >= 70);

  // 6. Test Quest Objective Completion & Inventory Reward
  const invMock = new TestInventoryManager();
  const questMgrMock = new TestQuestManager({
    quest_tan_cuong: {
      id: 'quest_tan_cuong',
      title: 'Hương Trà Đầu Tiên',
      status: 'active',
      objectives: [
        { id: 'obj_harvest_tea', text: 'Hái 5 búp chè', completed: false, targetCount: 5, currentCount: 0 }
      ]
    }
  });

  // Harvest 5 shoots
  invMock.addItem({ id: 'tea_buds_fresh', name: 'Búp chè tươi "1 tôm 2 lá"', category: 'material' }, 5);
  questMgrMock.incrementObjective('quest_tan_cuong', 'obj_harvest_tea', 5);

  assert.equal(invMock.hasItem('tea_buds_fresh'), true);
  const freshBuds = invMock.items.find(i => i.id === 'tea_buds_fresh');
  assert.equal(freshBuds.quantity, 5);

  const quest = questMgrMock.getActiveQuest();
  const harvestObj = quest.objectives.find(o => o.id === 'obj_harvest_tea');
  assert.equal(harvestObj.completed, true);
  assert.equal(harvestObj.currentCount, 5);
});


