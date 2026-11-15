(() => {
  const o = (value, label, other = false) => ({ value, label, other });
  const single = (id, section, title, options, extra = {}) => ({ id, section, title, type: "single", options, required: true, ...extra });
  const multi = (id, section, title, options, extra = {}) => ({ id, section, title, type: "multi", options, required: true, ...extra });
  const text = (id, section, title, extra = {}) => ({ id, section, title, type: "text", required: true, ...extra });
  const textarea = (id, section, title, extra = {}) => ({ id, section, title, type: "textarea", required: false, ...extra });
  const yesNoInterest = [o("1", "完全没有兴趣"), o("2", "兴趣较低"), o("3", "一般"), o("4", "比较感兴趣"), o("5", "非常感兴趣")];
  const satisfaction = [o("1", "非常不满意"), o("2", "比较不满意"), o("3", "一般"), o("4", "比较满意"), o("5", "非常满意")];
  const nights = [o("0", "0 晚"), o("1", "1 晚"), o("2", "2 晚"), o("3", "3 晚"), o("4", "4 晚及以上")];
  const transport = [
    o("own_car", "从常住地全程自驾"),
    o("rental", "乘飞机或火车到达后租车"),
    o("public", "公共交通结合当地接驳"),
    o("tour", "跟团或参加统一组织的线路"),
    o("other", "其他，请注明", true)
  ];
  const companions = [
    o("alone", "独自出游"), o("partner", "伴侣"), o("children", "带未成年子女的家庭成员"),
    o("elders", "父母或其他年长家庭成员"), o("friends", "朋友或同事"), o("other", "其他，请注明", true)
  ];

  const ddProducts = [
    "鸭绿江断桥或抗美援朝相关参观",
    "虎山长城等历史文化体验",
    "河口、绿江村或浑江口沿边观光",
    "东港滨海或湿地观鸟",
    "海鲜、烧烤等地方餐饮",
    "草莓、蓝莓等采摘或特产购买",
    "农家院、民宿或乡村生活体验",
    "露营、房车或自驾驿站服务"
  ];
  const gxProducts = [
    "友谊关及边关历史体验",
    "东兴口岸或国门景区游览",
    "竹山村、G219 终点或界碑参观",
    "万尾金滩或其他滨海体验",
    "京族文化或地方民俗体验",
    "中越风味餐饮",
    "东盟商品或地方特产购买",
    "界河游等边境体验，不含实际出境",
    "民宿、露营或自驾驿站服务"
  ];

  window.SURVEY = {
    title: "黄金大外环旅游需求、停留消费与产品体验调查问卷",
    questions: [
      single("S1", "screen", "您是否已满 18 周岁？", [o("yes", "是"), o("no", "否")]),
      multi("S2", "screen", "近 24 个月内，您是否以旅游、休闲或度假为目的，到访过以下地方？", [
        o("dd", "辽宁省丹东市"), o("px", "广西凭祥市"), o("dx", "广西东兴市"), o("none", "以上地方均未到访过")
      ], { exclusive: ["none"], help: "仅路过但没有实际游览的，请在下一题中进一步说明。" }),
      multi("S3_DD", "screen", "您最近一次在丹东旅游时，实际游览或体验过哪些地方？", [
        o("history", "鸭绿江断桥或抗美援朝相关纪念场馆"), o("hushan", "虎山长城"),
        o("hekou", "河口景区"), o("lvjiang", "绿江村、浑江口或浑江大转弯"),
        o("donggang", "东港滨海区域或鸭绿江口湿地"), o("city_other", "丹东市区其他旅游节点", true),
        o("other", "其他乡镇或景区", true), o("pass", "只是经过或停留，没有实际游览")
      ], { exclusive: ["pass"], max: 7 }),
      multi("S3_GX", "screen", "您最近一次在凭祥或东兴旅游时，实际游览或体验过哪些地方？", [
        o("youyi", "友谊关景区"), o("pingxiang", "凭祥市区或凭祥口岸周边"),
        o("dongxing", "东兴口岸或国门景区"), o("zhushan", "竹山村、G219 终点相关节点或大清国一号界碑"),
        o("jintan", "万尾金滩或京族三岛"), o("fcg_other", "防城港其他滨海旅游节点", true),
        o("other", "其他乡镇或景区", true), o("pass", "只是经过或停留，没有实际游览")
      ], { exclusive: ["pass"], max: 7 }),
      single("S4", "screen", "您在两个案例地均有旅游经历。最近一次到访的是哪里？", [
        o("dd", "丹东"), o("gx", "凭祥—东兴")
      ]),
      single("S5_TIME", "screen", "您最近一次上述行程发生在什么时候？", [
        o("0-6", "近 6 个月内"), o("7-12", "7—12 个月前"),
        o("13-18", "13—18 个月前"), o("19-24", "19—24 个月前")
      ]),
      single("S5_SEASON", "screen", "该次行程主要发生在哪个季节？", [
        o("spring", "春季"), o("summer", "夏季"), o("autumn", "秋季"), o("winter", "冬季")
      ]),
      single("C1", "awareness", "在今天填写问卷之前，您是否听说过“黄金大外环”？", [
        o("never", "从未听说过"), o("heard", "听说过，但不了解具体内容"),
        o("some", "有一些了解"), o("known", "比较了解")
      ]),
      multi("C2", "awareness", "在今天填写问卷之前，您听说过以下哪些国道？", [
        o("g219", "G219"), o("g331", "G331"), o("g228", "G228"), o("none", "都没有听说过")
      ], { exclusive: ["none"] }),
      single("C3", "awareness", "在阅读接下来的介绍之前，您目前对沿边、沿海分段旅游的兴趣程度是？", yesNoInterest),
      {
        id: "INFO", section: "info", type: "info", required: false,
        title: "黄金大外环与案例地介绍",
        help: "请阅读以下说明，再根据实际情况作答。",
        sections: [
          { title: "黄金大外环简介", text: "黄金大外环是由 G219、G331、G228 三条国道构成的沿边沿海通道。游客可以选择其中一段游览，不需要完成整个环线。本调查主要关注游客在目的地的停留、消费和旅游产品体验。" },
          { title: "丹东案例简介", text: "丹东案例包括丹东市区、宽甸及东港等相关旅游节点。主要体验包括鸭绿江沿岸景观、断桥及抗美援朝相关历史、虎山长城、河口和绿江村等沿边节点，以及东港滨海、湿地和地方餐饮。游客可以游览市区，也可以选择沿边或沿海分段行程。" },
          { title: "广西凭祥—东兴案例简介", text: "凭祥—东兴案例包括友谊关、凭祥市区及口岸周边、东兴国门、竹山村、万尾金滩和京族三岛等节点。主要体验包括边关历史、口岸文化、地方生活、京族文化、滨海景观及中越风味美食。游客可以选择单城停留，也可以根据时间串联游览。" }
        ]
      },
      single("C5", "choice", "如果未来安排一次相关旅行，您更会考虑哪个目的地？", [
        o("dd", "丹东"), o("gx", "广西凭祥—东兴"), o("both", "两者都会考虑"),
        o("none", "两者暂都不考虑"), o("unsure", "目前无法判断")
      ]),
      multi("C6", "choice", "您作出上述选择的主要原因是什么？", [
        o("nature", "自然或滨海景观"), o("history", "历史文化或红色旅游"),
        o("border", "边境、界碑或口岸体验"), o("culture", "民族文化或地方生活体验"),
        o("food", "地方美食或特色商品"), o("drive", "公路旅行或自驾体验"),
        o("transport", "距离和交通便利程度"), o("budget", "时间和预算比较合适"),
        o("experience", "曾经去过，体验较好"), o("recommendation", "亲友推荐或网络内容影响"),
        o("other", "其他，请注明", true)
      ], { max: 3 }),

      single("P1", "potential", "未来 12 个月内，您实际安排一次类似分段旅行的可能性是？", [
        o("1", "完全不可能"), o("2", "可能性较低"), o("3", "不确定"), o("4", "可能性较大"), o("5", "可能性很大")
      ]),
      single("P2", "potential", "您更能接受哪种旅行方式？", [
        o("continuous", "一次连续长途旅行，游览多个区域"), o("segments", "分次出游，每次体验一个较短路段"),
        o("base", "在一个城市住宿，再游览周边节点"), o("flexible", "多次短途旅行与一次长途旅行都可以"),
        o("unsure", "目前无法判断")
      ]),
      single("P3", "potential", "对此类旅行，您单次实际能够安排的天数是？", [
        o("1-2", "1—2 天"), o("3-4", "3—4 天"), o("5-7", "5—7 天"), o("8+", "8 天及以上"), o("unsure", "暂不确定")
      ]),
      single("P4", "potential", "如果自驾出游，您单日能够接受的驾驶时长是？", [
        o("<2", "2 小时以内"), o("2-3", "2—3 小时"), o("4-5", "4—5 小时"),
        o("6+", "6 小时及以上"), o("none", "不打算自驾或无法判断")
      ]),
      single("P5", "potential", "您更倾向选择哪种交通方式？", [...transport, o("unsure", "暂不确定")]),
      single("P6", "potential", "您最可能与谁同行？", companions),
      single("P7", "potential", "以一次 3—5 天的行程为例，您能接受的人均总预算是？", [
        o("<1500", "1500 元以下"), o("1500-2999", "1500—2999 元"), o("3000-4999", "3000—4999 元"),
        o("5000-7999", "5000—7999 元"), o("8000+", "8000 元及以上"), o("unsure", "暂不确定")
      ]),
      multi("P8", "potential", "您最希望体验哪些内容？", [
        o("nature", "自然、山水或滨海观光"), o("history", "边境历史或红色历史"),
        o("landmark", "界碑、口岸等边境地标"), o("culture", "民族文化或地方生活"),
        o("food", "地方美食"), o("shopping", "特色商品或农产品购买"),
        o("outdoor", "摄影、观鸟或户外体验"), o("camping", "露营、房车或公路驿站体验"),
        o("events", "节庆、赛事或演出"), o("other", "其他，请注明", true)
      ], { max: 4 }),
      single("P9", "potential", "您更偏好哪种行程组织方式？", [
        o("independent", "完全自行规划和预订"), o("partial", "自行规划为主，购买部分门票或体验项目"),
        o("package", "购买包含住宿、交通和部分活动的半自助套餐"), o("tour", "参加统一组织的旅行团"),
        o("price", "根据价格和具体产品决定"), o("unsure", "暂不确定")
      ]),
      single("P10", "potential", "您更偏好哪种住宿方式？", [
        o("chain", "连锁或标准酒店"), o("resort", "特色酒店或度假酒店"), o("bnb", "民宿或农家院"),
        o("camping", "露营、房车或车内住宿"), o("friends", "亲友住所"),
        o("mixed", "根据行程组合不同住宿"), o("unsure", "暂不确定")
      ]),
      multi("P11", "potential", "出发前，您最需要了解哪些信息？", [
        o("roads", "路线、路况和驾驶难度"), o("weather", "天气及季节性限制"),
        o("border", "边境游览要求和相关管理规定"), o("opening", "景点开放时间及预约要求"),
        o("prices", "门票、住宿、餐饮和体验项目价格"), o("facilities", "停车、加油、充电和维修位置"),
        o("itinerary", "推荐行程及每日时间安排"), o("rescue", "医疗、救援和紧急联系方式"),
        o("other", "其他，请注明", true)
      ], { max: 3 }),
      multi("P12", "potential", "您认为当地最需要提供哪些服务？", [
        o("basic", "停车、厕所和休息设施"), o("vehicle", "加油、充电和车辆维修"),
        o("signage", "清晰的标识与路线导览"), o("transfer", "当地交通接驳"),
        o("hospitality", "合适的住宿和餐饮"), o("culture", "有组织的文化或生活体验"),
        o("safety", "救援、医疗和安全保障"), o("packages", "联票、套餐或优惠产品"),
        o("other", "其他，请注明", true)
      ], { max: 3 }),
      multi("P13", "potential", "哪些因素最可能阻碍您实际出游？", [
        o("distance", "距离太远"), o("time", "假期不足"), o("cost", "总费用过高"),
        o("fatigue", "驾驶疲劳或交通不便"), o("safety", "天气、路况或安全顾虑"),
        o("border", "对边境游览要求不了解"), o("information", "行程信息不足或难以判断真实性"),
        o("facilities", "住宿、餐饮或其他设施不符合要求"), o("commercial", "担心体验单一或过度商业化"),
        o("companions", "同行者意见难以协调"), o("other", "其他，请注明", true)
      ], { max: 3 }),
      textarea("P14", "potential", "如果目的地能够增加一种产品或服务，您最希望是什么？", { help: "选答。" }),

      single("V1", "actual", "本次行程中，您主要采用哪种交通方式？", transport),
      {
        id: "V2", section: "actual", type: "number", required: true,
        title: "本次出行共有多少人，包括您本人？", min: 1, max: 50, unit: "人"
      },
      single("V3", "actual", "您的同行者主要是？", [
        ...companions.slice(0, 5), o("strangers", "旅行团中原本不认识的人"), o("other", "其他，请注明", true)
      ]),
      single("V4", "actual", "您在本次行程规划和消费决策中的参与程度是？", [
        o("main", "主要由我安排和决定"), o("shared", "与同行者共同决定"),
        o("informed", "我参与较少，但了解行程和支出"), o("unaware", "基本不参与决策，对支出也不太清楚")
      ]),
      single("V5", "actual", "本次整个出行持续了多少天？", [
        o("1", "1 天"), o("2", "2 天"), o("3", "3 天"), o("4", "4 天"), o("5", "5 天"), o("6+", "6 天及以上")
      ]),
      single("V6", "actual", "您本次在所调查目的地实际住宿了多少晚？", nights),
      single("V7", "actual", "您在当地的实际停留时间与原计划相比如何？", [
        o("shorter", "比原计划缩短"), o("same", "与原计划基本一致"), o("longer", "比原计划延长")
      ]),
      multi("V7A", "actual", "停留时间发生变化的主要原因是什么？", [
        o("weather", "天气或路况"), o("fatigue", "驾驶疲劳或交通不便"),
        o("hospitality", "住宿或餐饮条件"), o("expectation", "实际体验与预期不同"),
        o("discovery", "发现了值得继续体验的产品"), o("budget", "费用或预算变化"),
        o("companions", "同行者意见或身体情况"), o("schedule", "后续行程安排变化"),
        o("other", "其他，请注明", true)
      ], { max: 3 }),
      textarea("V8", "actual", "请按先后顺序填写本次实际到访的主要节点。", { help: "选答。例如：节点 A → 节点 B → 节点 C。" }),
      multi("V9", "actual", "本次行程中，是否存在“到了某个节点但没有停留、体验或消费”的情况？", [
        o("none", "没有这种情况"), o("time", "有，因为时间不足"), o("interest", "有，因为实际吸引力不足"),
        o("price", "有，因为价格或费用不合适"), o("transport", "有，因为交通或停车不方便"),
        o("weather", "有，因为天气或现场拥挤"), o("information", "有，因为缺乏介绍或不知道可以体验什么"),
        o("facilities", "有，因为设施或服务不符合预期"), o("other", "其他，请注明", true)
      ], { exclusive: ["none"], max: 4 }),
      {
        id: "V10", section: "actual", type: "spending", required: false,
        title: "本次同行出游小组在当地的实际支出大约是多少？",
        help: "请填写整个同行小组的金额，不包括从常住地往返目的地的大交通费用。没有支出的项目填 0；无法准确分项时，可只填写总支出。",
        rows: ["住宿", "餐饮", "景区门票", "文化体验、娱乐或活动项目", "特产、纪念品及其他购物", "当地租车、接驳、停车等交通支出", "其他支出", "无法准确分项时，填写当地总支出"]
      },
      {
        id: "V11", section: "actual", type: "matrix", required: true,
        title: "本次行程中，您实际体验或购买了哪些产品？",
        help: "请逐行选择；没有接触过的产品可选择“不了解”。",
        columns: [o("not", "未体验"), o("free", "免费体验"), o("paid", "付费体验"), o("unknown", "不了解该产品")]
      },
      single("V12", "actual", "您对本次行程的总体满意度是？", satisfaction),
      {
        id: "V13", section: "actual", type: "matrix", required: true,
        title: "您如何评价本次行程中的以下服务？",
        rows: ["路线和目的地信息", "交通和当地接驳", "停车、补给、充电等设施", "住宿和餐饮", "文化和体验活动", "价格透明程度", "安全和应急保障"],
        columns: [...satisfaction, o("unknown", "未使用或不了解")]
      },
      multi("V14", "actual", "本次行程中，您遇到过哪些未满足需求？", [
        o("none", "没有明显未满足需求"), o("missing", "想体验某个项目，但找不到相应产品"),
        o("inconvenient", "想购买某个产品，但购买不方便"), o("price", "有产品，但价格不符合预期"),
        o("quality", "有产品，但质量或内容不符合预期"), o("stay", "想延长停留，但缺少合适的住宿或活动"),
        o("information", "难以获得准确、及时的行程信息"), o("facilities", "停车、充电、接驳或救援不方便"),
        o("other", "其他，请注明", true)
      ], { exclusive: ["none"], max: 4 }),
      textarea("V15", "actual", "如果再次到访，您最希望当地增加或改进什么产品或服务？", { help: "选答。" }),
      {
        id: "V16", section: "actual", type: "nps", required: true,
        title: "您有多大可能向亲友推荐这个目的地？",
        help: "0 分表示完全不可能推荐，10 分表示非常愿意推荐。"
      },
      single("V17", "actual", "如果当地的产品、信息和服务有所改善，您未来延长停留或再次到访的可能性是？", [
        o("1", "完全不可能"), o("2", "可能性较低"), o("3", "不确定"), o("4", "可能性较大"), o("5", "可能性很大")
      ]),
      textarea("V18", "actual", "本次行程中，哪一个产品、节点或服务给您留下的印象最深？请简要说明原因。", { required: true }),

      single("B1", "both", "您在另一地旅游时住宿了多少晚？", [...nights, o("unknown", "记不清")]),
      single("B2", "both", "您对另一地那次行程的总体满意度是？", [...satisfaction, o("unknown", "记不清")]),
      single("B3", "both", "综合两次实际经历，您更愿意推荐哪里？", [
        o("dd", "丹东"), o("gx", "广西凭祥—东兴"), o("both", "两者都愿意推荐"),
        o("none", "两者都不太愿意推荐"), o("unsure", "无法比较")
      ]),
      textarea("B3_REASON", "both", "您作出上述推荐选择的主要原因是什么？", { help: "选答。" }),

      single("D1", "demographic", "您的性别是？", [
        o("male", "男"), o("female", "女"), o("other", "其他"), o("private", "不愿透露")
      ]),
      single("D2", "demographic", "您的年龄是？", [
        o("18-25", "18—25 岁"), o("26-35", "26—35 岁"), o("36-45", "36—45 岁"),
        o("46-55", "46—55 岁"), o("56-65", "56—65 岁"), o("66+", "66 岁及以上")
      ]),
      {
        id: "D3", section: "demographic", type: "residence", required: true,
        title: "您目前常住的省市是？"
      },
      single("D4", "demographic", "您目前的职业或身份是？", [
        o("student", "在校学生"), o("employee", "企业职员"), o("public", "机关事业单位工作人员"),
        o("freelance", "个体经营或自由职业"), o("retired", "离退休人员"),
        o("none", "暂无固定职业"), o("other", "其他，请注明", true)
      ]),
      single("D5", "demographic", "您的最高学历是？", [
        o("high", "高中或中专及以下"), o("college", "大专"), o("bachelor", "本科"),
        o("master", "硕士及以上"), o("private", "不愿透露")
      ], { required: false }),
      single("D6", "demographic", "您个人每月可支配收入大约是？", [
        o("<3000", "3000 元以下"), o("3000-5999", "3000—5999 元"),
        o("6000-9999", "6000—9999 元"), o("10000-14999", "10000—14999 元"),
        o("15000+", "15000 元及以上"), o("private", "不愿透露")
      ], { required: false }),
      single("D7", "demographic", "近 12 个月内，您外出旅游的次数大约是？", [
        o("0", "0 次"), o("1-2", "1—2 次"), o("3-5", "3—5 次"), o("6+", "6 次及以上")
      ]),
      single("D8", "demographic", "您以驾驶员或乘车人身份参加自驾旅游的经历大约是？", [
        o("0", "从未有过"), o("1-2", "1—2 次"), o("3-5", "3—5 次"), o("6+", "6 次及以上")
      ]),
      single("D9", "demographic", "作答质量确认：本题请选择“比较同意”。", [
        o("1", "完全不同意"), o("2", "比较不同意"), o("3", "不确定"), o("4", "比较同意"), o("5", "完全同意")
      ]),
      { id: "END", section: "end", type: "end", required: false, title: "问卷已完成" }
    ]
  };
})();
