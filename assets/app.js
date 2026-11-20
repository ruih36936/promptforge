/* =========================================================================
 * PromptForge · 提示词锻造炉
 * 纯前端规则引擎：无依赖、无网络请求、可离线、可托管 GitHub Pages。
 *
 * 想加自己的场景？改下面第 1 节的 TYPES（任务类型）和 TEMPLATES（模板库）即可。
 * ========================================================================= */
(function () {
  'use strict';

  /* ======================= 1. 配置数据 ======================= */

  var REPO_URL = 'https://github.com/ruih36936/promptforge'; // 页脚 GitHub 链接

  var MODELS = {
    generic:  { label: '通用（Kimi / 豆包 / 通义）', style: 'md'  },
    gpt:      { label: 'GPT / o 系列',              style: 'md'  },
    claude:   { label: 'Claude',                    style: 'xml' },
    deepseek: { label: 'DeepSeek',                  style: 'md'  },
    gemini:   { label: 'Gemini',                    style: 'md'  },
    local:    { label: '本地小模型（Qwen / Llama）', style: 'md' }
  };

  var TONES = {
    pro:      { label: '专业严谨', line: '语气：专业、克制、有依据，不用感叹号和营销腔。' },
    plain:    { label: '通俗易懂', line: '语气：像跟普通人聊天，术语第一次出现必须用一句人话解释。' },
    brief:    { label: '简洁直接', line: '语气：能一句说完不写两句，删掉所有过渡句和客套话。' },
    warm:     { label: '有感染力', line: '语气：有画面感和情绪，但不用空洞形容词堆砌。' },
    academic: { label: '学术客观', line: '语气：学术、可证伪，每个论断标注依据强度（强 / 中 / 弱）。' },
    fun:      { label: '轻松幽默', line: '语气：轻松带点幽默，但信息密度不降，不为搞笑牺牲准确。' }
  };

  var DETAILS = {
    lite:   { label: '极简', line: '篇幅：能短则短，先给结论，只保留删不掉的部分。' },
    normal: { label: '适中', line: '篇幅：按内容实际需要写，够用就停，不要为了显得完整而注水。' },
    full:   { label: '详尽', line: '篇幅：允许写长，把推理过程、备选方案和风险都讲清楚，但不许注水。' }
  };

  /* ---- 任务类型：role 决定视角，rules 决定硬约束，format 决定交付形状 ---- */
  var TYPES = {
    auto: {
      label: '自动识别', icon: '🤖', kw: [],
      role: '你是一名资深专业人士，先想清楚要求再动手，宁可多问一句也不猜。',
      deliver: '一份高质量、可直接使用的成果',
      slots: [
        { k: 'audience', ask: '这份东西给谁看 / 给谁用' },
        { k: 'platform', ask: '用在哪里、篇幅有什么限制' },
        { k: 'hard', ask: '必须包含的信息或必须避开的东西' }
      ],
      rules: ['所有内容必须服务于我明确说出的目标，不要自行扩展我的需求', '不要输出思考过程，直接给成品'],
      format: '结论先行，再展开依据与细节；能用清单就不用大段文字。',
      checks: ['是否解决了我真正要解决的问题？'],
      asks: ['你这份成果主要用来做什么？'],
      sample: '帮我把这段乱糟糟的想法整理成一份能发给老板的方案'
    },

    writing: {
      label: '写作 / 文案', icon: '✍️',
      kw: ['写', '文案', '文章', '稿', '软文', '小红书', '公众号', '标题', '宣传', '故事', '口播', '脚本', '邮件', '朋友圈', '推文', 'slogan', '笔记', '介绍'],
      role: '你是「资深内容策划」，12 年经验，做过公众号、小红书、短视频三个平台的头部账号；擅长把专业信息写成普通人愿意读完、愿意转发的文字，也清楚各平台的审核红线。',
      deliver: '一篇可以直接发布的成品',
      slots: [
        { k: 'audience', ask: '目标读者是谁（年龄 / 职业 / 最痛的事）' },
        { k: 'platform', ask: '发在哪个平台，字数上限多少' },
        { k: 'goal', ask: '希望读者看完做什么（收藏 / 关注 / 下单 / 转发）' },
        { k: 'points', ask: '必须出现的卖点或信息点' }
      ],
      rules: [
        '开头 3 句内必须让读者觉得「这跟我有关」，禁止先铺垫背景再进正题',
        '每个观点必须落到具体场景、数字或案例；出现一个形容词，就要配一个证据',
        '禁用词：赋能、闭环、抓手、颠覆、极致、震撼、YYDS、家人们、宝子们',
        '单段不超过 4 行，长句拆短句；不用「首先 / 其次 / 最后」这类作文腔',
        '不使用任何未经确认的参数、价格、认证、用户量'
      ],
      format: '按「钩子 → 痛点 → 方案 → 证据 → 行动」五段推进，每段一个小标题；正文之后单独给 3 个备选标题（分别偏点击 / 偏搜索 / 偏共鸣）。',
      checks: [
        '标题能不能让人一眼判断「这跟我有关」？',
        '有没有哪一段删掉后不影响理解？有就删掉',
        '是否出现了禁用词？',
        '每个结论是否有具体例子、数字或出处？',
        '读者读完知不知道下一步做什么？'
      ],
      asks: ['这篇内容发在哪个平台？字数上限多少？', '目标读者最痛的一件事是什么（要具体）？', '有没有必须提到的产品名、价格、活动信息？'],
      sample: '帮我写一篇小红书笔记，介绍我们家的护眼台灯'
    },

    code: {
      label: '代码 / 工程', icon: '💻',
      kw: ['代码', '函数', '程序', '脚本', 'bug', '报错', '接口', 'api', 'sql', 'python', 'javascript', 'java', '实现', '重构', '算法', '正则', '爬虫'],
      role: '你是一个 10 年经验的工程师，负责过线上高并发系统，习惯先确认约束再写代码，最讨厌「看起来能跑」的实现。',
      deliver: '一份可以直接落地的实现方案 + 完整可运行代码',
      slots: [
        { k: 'tech', ask: '语言 / 框架 / 版本，以及运行环境' },
        { k: 'io', ask: '输入是什么样子，输出要什么样子' },
        { k: 'edge', ask: '必须处理的边界情况（空值 / 超长 / 并发 / 超时）' },
        { k: 'forbid', ask: '不能用的依赖或不能改的部分' }
      ],
      rules: [
        '先在开头一句话确认你的假设（环境、版本、数据结构）；不确定的假设必须标出来',
        '不得引入我没提到的第三方依赖，能用标准库就用标准库',
        '必须显式处理边界：空值、类型错误、超长输入、异常、超时',
        '给出可以直接复制运行的完整代码，禁止「此处省略」「其余同上」',
        '说明时间 / 空间复杂度，以及这个方案的已知短板'
      ],
      format: '输出 4 段：① 我的理解与假设 ② 方案与取舍理由 ③ 完整代码（关键处有注释）④ 如何验证 + 已知风险。',
      checks: [
        '这段代码复制到空文件里能直接跑起来吗？',
        '边界输入会不会崩？',
        '有没有引入我没允许的依赖？',
        '出问题时，报错信息能指出是哪一步吗？'
      ],
      asks: ['运行环境和语言版本是什么？', '输入数据的真实样例能给一段吗？'],
      sample: '用 Python 写个函数，扫描一个文件夹，把重复的图片找出来并保留最清晰的一张'
    },

    analyze: {
      label: '分析 / 研究', icon: '📊',
      kw: ['分析', '研究', '数据', '报告', '原因', '为什么', '评估', '调研', '对比', '趋势', '指标', '复盘'],
      role: '你是一名严谨的分析师，习惯把「事实 / 推断 / 判断」分开放，写结论前一定先找反例。',
      deliver: '一份有结论、有依据、可被质疑的分析',
      slots: [
        { k: 'question', ask: '要回答的核心问题是什么（一句话）' },
        { k: 'data', ask: '手上有什么数据 / 材料，口径是什么' },
        { k: 'frame', ask: '用哪个分析框架，或希望从哪几个维度切' },
        { k: 'stake', ask: '这个结论会被用来做什么决定' }
      ],
      rules: [
        '把「已知事实 / 合理推断 / 个人判断」三类分开标注，不许混在一起说',
        '每给出一个结论，必须同时给出至少一个反例或反面证据',
        '不得编造数据、出处、调研结论；查不到就写「无公开数据」',
        '结论必须给置信度（高 / 中 / 低）和成立条件',
        '区分相关性和因果性，凡是因果推断必须说明机制'
      ],
      format: '① 结论先行（3 句以内）② 依据与数据 ③ 反方观点，以及为什么不足以推翻结论 ④ 置信度与成立条件 ⑤ 还需要什么信息才能提高置信度。',
      checks: [
        '结论里有没有把相关性说成因果？',
        '有没有一处数据是我编的？',
        '反方观点是否认真写了，还是敷衍一句？',
        '如果这个结论是错的，最可能是哪个假设错了？'
      ],
      asks: ['数据的时间范围和口径是什么？', '这份分析最后谁会看、要支撑什么决策？'],
      sample: '这份销售数据（贴数据），帮我分析为什么 8 月销量掉了 20%'
    },

    learn: {
      label: '学习 / 讲解', icon: '📚',
      kw: ['讲讲', '解释', '什么是', '怎么理解', '入门', '学习', '教程', '原理', '面试', '教我', '搞懂'],
      role: '你是一位擅长把复杂概念讲到新手能懂的老师，习惯「先建立直觉，再补细节」，并且清楚新手会卡在哪。',
      deliver: '一份能让人真正学会的讲解',
      slots: [
        { k: 'level', ask: '我现在的水平（已经会什么）' },
        { k: 'aim', ask: '学到什么程度算够（能看懂 / 能上手 / 能讲给别人）' },
        { k: 'pain', ask: '我之前卡在哪里' }
      ],
      rules: [
        '先用我已经会的东西做类比，再上定义；不许一上来就甩术语',
        '每讲一个抽象概念，必须配一个生活化例子 + 一个反例',
        '明确列出新手最容易搞错的 3 个地方',
        '不许用「简单来说」「众所周知」跳过关键步骤',
        '不要为了通俗而牺牲准确性；两难时先保准确，再补一个类比'
      ],
      format: '① 一句话说清它是什么 ② 用我熟悉的东西类比 ③ 拆成 3–5 步 ④ 一个具体例子走完整流程 ⑤ 常见误解 ⑥ 3 道自测题（答案折叠到最后）。',
      checks: [
        '每一步我都能用自己的话复述出来吗？',
        '有没有哪一步是「跳过去」的？',
        '例子是否真的对应概念，还是只是听起来像？'
      ],
      asks: ['你学它是为了解决什么具体问题？', '有没有哪个相关概念你已经会了？'],
      sample: '给我讲讲什么是向量数据库，我只会写 Python 基础语法'
    },

    translate: {
      label: '翻译 / 改写', icon: '🌐',
      kw: ['翻译', '英文', '中译英', '英译中', '改写', '润色', '地道', '术语', '本地化'],
      role: '你是一名专业译者，做过技术文档与商务合同的双语本地化，清楚「直译」和「读者能读懂」之间的差别。',
      deliver: '一份可以直接使用的译文',
      slots: [
        { k: 'lang', ask: '从什么语言译到什么语言' },
        { k: 'domain', ask: '领域（技术 / 法律 / 市场 / 学术），以及读者是谁' },
        { k: 'keep', ask: '必须保持原样的词（品牌名 / 代码 / 型号）' },
        { k: 'style', ask: '要正式还是口语，要不要保留原文语气' }
      ],
      rules: [
        '优先保证目标语言读者读起来自然，允许调整语序，但不许增删信息',
        '专业术语必须统一，首次出现时给「译名（原文）」',
        '不得意译掉限定条件、否定、数字、单位、时态',
        '专有名词、代码、型号保持原样不翻译',
        '原文有歧义时，选择语义最保守的一种译法，并在备注里说明'
      ],
      format: '先给完整译文；然后单列「术语对照表」；最后列出 3 处你做了调整的地方及原因。',
      checks: [
        '有没有哪句话的信息量比原文多了或少了？',
        '术语前后是否一致？',
        '数字、单位、否定词有没有走样？'
      ],
      asks: ['这段文字最终给谁看？', '有没有已经固定下来的官方译名？'],
      sample: '把下面这段英文产品说明翻成中文，要能直接放到官网上'
    },

    creative: {
      label: '创意 / 发散', icon: '💡',
      kw: ['点子', '创意', '想几个', '头脑风暴', '取名', '名字', '方案', '脑洞', '构思', '标题'],
      role: '你是一个脑洞大但落地能力强的创意总监，习惯先发散再收敛，讨厌「四平八稳等于正确」的方案。',
      deliver: '一批方向明显不同的可选方案，并给出推荐',
      slots: [
        { k: 'count', ask: '要几个方案' },
        { k: 'bounds', ask: '硬边界（预算 / 人力 / 法规 / 不能做什么）' },
        { k: 'judge', ask: '用什么标准判断好坏' }
      ],
      rules: [
        '先给数量再谈质量：方案之间必须方向明显不同',
        '每个方案必须说明「它靠什么打动人」，不能只有一个名字',
        '禁止把同一个想法换 5 种说法充数',
        '至少有一个方案是反常识的，并说明它的风险',
        '不许出现「结合线上线下」「打造闭环生态」这类空话'
      ],
      format: '① 各个方案（每个：一句话概念 / 目标人群 / 为什么有效 / 风险）② 挑 2 个最值得做的并说明理由 ③ 如果只有一周时间，先做哪个。',
      checks: [
        '这些方案是不是换汤不换药？',
        '有没有哪个方案根本执行不了？',
        '每个方案都能说出「凭什么有效」吗？'
      ],
      asks: ['预算和人力大概是什么量级？', '有没有做过但失败了的尝试？'],
      sample: '给我们的健身房想 10 个拉新的点子，预算很少'
    },

    office: {
      label: '办公 / 文档', icon: '🗂️',
      kw: ['周报', '日报', '会议纪要', '总结', '表格', 'ppt', '汇报', '整理', '流程', '制度', '邮件', '通知'],
      role: '你是一名资深运营 / 行政负责人，最擅长把杂乱的原始信息整理成别人一眼就能用的文档。',
      deliver: '一份可以直接发出去的文档',
      slots: [
        { k: 'audience2', ask: '给谁看（上级 / 同事 / 客户）' },
        { k: 'purpose', ask: '这份文档要促成什么决定或动作' },
        { k: 'material', ask: '手上已有的原始材料' }
      ],
      rules: [
        '严格按我给的结构输出，不要自行增加章节',
        '所有信息必须来自我给的材料；缺失的标「待确认」，绝不许编',
        '能用表格 / 清单就不用大段叙述，优先让人扫读',
        '不写「在领导的关怀下」这类空话，直接给事实和结论'
      ],
      format: '按「结论 → 关键数据 → 待办与责任人 → 风险」顺序输出；能用表格就用表格。',
      checks: [
        '上级扫 10 秒能不能抓到重点？',
        '有没有一条信息是我自己脑补的？',
        '每件待办都有负责人和时间吗？'
      ],
      asks: ['这份文档要发给谁，他最关心什么？', '有没有固定的模板格式要求？'],
      sample: '把这次会议的零散记录整理成一份正式的会议纪要'
    },

    decide: {
      label: '决策 / 建议', icon: '⚖️',
      kw: ['要不要', '纠结', '选择', '决策', '该不该', '建议', '值不值', '利弊', '权衡', '参谋', '买车', '选哪个', '划算', '换工作'],
      role: '你是一名做过大量真实决策的顾问，习惯先把选项摆平，再明确权衡标准，最后给一个有条件的建议，而不是和稀泥。',
      deliver: '一个能拍板的建议',
      slots: [
        { k: 'options', ask: '现在有哪些选项（包括「什么都不做」）' },
        { k: 'criteria', ask: '你最在意什么（钱 / 时间 / 风险 / 成长）' },
        { k: 'risk', ask: '你能承受的最坏结果是什么' }
      ],
      rules: [
        '先把所有选项列全，包括「什么都不做」',
        '明确指出权衡维度并按重要性排序，不要平均打分',
        '必须说明「在什么情况下，推荐会反过来」',
        '给出可逆性判断：这个决定做错了能不能改回来',
        '最后必须给一个明确倾向，不许「各有优劣，看你」'
      ],
      format: '① 一句话建议 ② 选项对比表（维度 × 选项）③ 关键假设（假设错了结论就变）④ 最坏情况与止损线 ⑤ 第一步该做什么。',
      checks: [
        '有没有漏掉「什么都不做」这个选项？',
        '建议是否明确，还是又推回给我了？',
        '关键假设有没有写出来？'
      ],
      asks: ['你做这个决定的时间窗口有多长？', '最坏的结果你能承受吗？'],
      sample: '我在纠结要不要辞职做独立开发，帮我理一下'
    },

    review: {
      label: '审阅 / 挑错', icon: '🧐',
      kw: ['审一下', '看看哪里', '挑错', '检查', '评价', '点评', '问题在哪', '改一下', '优化一下'],
      role: '你是一名严格的审稿人 / 代码评审员，职责是找出问题而不是夸奖，宁可挑刺也不要放过。',
      deliver: '一份具体到「改哪一句、怎么改」的修改清单',
      slots: [
        { k: 'target', ask: '要审的对象是什么（文案 / 代码 / 方案）' },
        { k: 'standard', ask: '按什么标准审（可读性 / 转化率 / 正确性 / 合规）' },
        { k: 'strict', ask: '严格程度（能发就行 / 要挑到挑不动为止）' }
      ],
      rules: [
        '按严重程度分级：致命 / 重要 / 建议，每条必须指出具体位置和原因',
        '不许说「整体不错」这类空话；确实没问题就写「未发现问题」',
        '每条问题必须给出可直接替换的改法，不能只说「建议优化」',
        '不许为了凑数编造问题',
        '先给结论：能不能直接发／能不能上线'
      ],
      format: '表格输出：位置 | 问题 | 严重程度 | 怎么改；表格之后给「如果只改 3 处，改哪 3 处」。',
      checks: [
        '每条问题都指到具体位置了吗？',
        '有哪条是我的个人偏好而不是客观问题？',
        '改法能直接替换吗？'
      ],
      asks: ['这个对象最终要达到什么目的？', '有没有绝对不能改的部分？'],
      sample: '帮我审一下这段产品文案，看看哪里会劝退用户'
    }
  };

  /* ---- 模板库 ---- */
  var TEMPLATES = [
    { id: 'xhs',   icon: '📕', name: '小红书笔记',   desc: '种草文案，带 3 个备选标题', type: 'writing',   tags: '小红书 种草 文案 笔记', raw: '帮我写一篇小红书笔记，介绍我们家的护眼台灯，希望有人愿意收藏' },
    { id: 'gzh',   icon: '📰', name: '公众号长文',   desc: '3000 字深度内容',        type: 'writing',   tags: '公众号 长文 文章', raw: '写一篇公众号长文，讲讲为什么现在年轻人开始反过度消费' },
    { id: 'video', icon: '🎬', name: '短视频口播',   desc: '60 秒脚本，有钩子有节奏',  type: 'writing',   tags: '抖音 口播 脚本 视频', raw: '帮我写一条 60 秒的抖音口播脚本，讲怎么用 3 步去掉手机相册里的重复照片' },
    { id: 'code',  icon: '⌨️', name: '写代码',       desc: '要求边界、依赖、可运行',   type: 'code',      tags: '代码 函数 实现 python', raw: '写个函数，把一堆乱七八糟的日期字符串统一成 YYYY-MM-DD' },
    { id: 'bug',   icon: '🐞', name: 'Bug 定位',     desc: '从报错倒查根因',          type: 'code',      tags: 'bug 报错 调试 排查', raw: '这段代码报错 KeyError: name，帮我看看哪里出问题了（贴代码）' },
    { id: 'sql',   icon: '🗄️', name: 'SQL 查询',     desc: '口径、分组、排序说清楚',    type: 'code',      tags: 'sql 数据库 查询 统计', raw: '帮我写一个 SQL，统计每个城市最近 30 天每天的下单人数' },
    { id: 'data',  icon: '📈', name: '数据分析报告', desc: '结论先行 + 找反例',        type: 'analyze',   tags: '数据 分析 报告 原因', raw: '这份销售数据（贴数据），帮我分析一下为什么 8 月销量掉了 20%' },
    { id: 'comp',  icon: '🔍', name: '竞品分析',     desc: '维度对比，落到可执行建议',  type: 'analyze',   tags: '竞品 对比 分析 调研', raw: '帮我对比我们家和竞品的会员体系，看看哪里该改' },
    { id: 'learn', icon: '📚', name: '学个新概念',   desc: '先直觉后细节，带自测题',   type: 'learn',     tags: '学习 讲解 概念 入门', raw: '给我讲讲什么是向量数据库，我只会写 Python 基础语法' },
    { id: 'inter', icon: '🎯', name: '面试准备',     desc: '题目 + 回答思路 + 追问',   type: 'learn',     tags: '面试 求职 准备', raw: '我要面试一个数据分析岗，帮我准备 10 个可能会被问到的问题和回答思路' },
    { id: 'trans', icon: '🌐', name: '中英翻译',     desc: '保术语、给对照表',         type: 'translate', tags: '翻译 英文 术语 本地化', raw: '把下面这段英文产品说明翻成中文，要能直接放到官网上' },
    { id: 'email', icon: '✉️', name: '商务邮件',     desc: '坏消息也要说得体面',       type: 'office',    tags: '邮件 商务 沟通 延期', raw: '帮我写封邮件，跟合作方说明我们的项目要延期两周，语气要客气但不能显得心虚' },
    { id: 'week',  icon: '📝', name: '周报总结',     desc: '从流水账提炼成价值',       type: 'office',    tags: '周报 日报 总结 复盘', raw: '把我这周的零散记录整理成一份周报（贴记录）' },
    { id: 'meet',  icon: '🗒️', name: '会议纪要',     desc: '结论、待办、责任人',       type: 'office',    tags: '会议 纪要 待办', raw: '把这次会议的零散记录整理成正式的会议纪要（贴记录）' },
    { id: 'decide',icon: '⚖️', name: '决策权衡',     desc: '给明确倾向，不和稀泥',     type: 'decide',    tags: '决策 选择 纠结 权衡', raw: '我在纠结要不要辞职做独立开发，帮我理一下' },
    { id: 'review',icon: '🧐', name: '文案审稿',     desc: '分级挑错，给替换句',       type: 'review',    tags: '审稿 挑错 文案 点评', raw: '帮我审一下这段产品文案，看看哪里会劝退用户' },
    { id: 'idea',  icon: '💡', name: '头脑风暴',     desc: '要 10 个方向不同的点子',   type: 'creative',  tags: '创意 点子 头脑风暴', raw: '给我们的健身房想 10 个拉新的点子，预算很少' },
    { id: 'name',  icon: '🏷️', name: '取名 / slogan', desc: '好记、不土、能注册',      type: 'creative',  tags: '取名 名字 slogan 品牌', raw: '帮我给一个卖手工皂的品牌想 10 个名字，要求好记、不土' }
  ];

  var UNIVERSAL_CHECKS = [
    '我是否直接回答了对方真正想要的东西，而不是他顺口提到的次要问题？',
    '有没有任何一处是我编的（数据 / 出处 / 版本 / 引文）？有就删掉或标注不确定',
    '是否严格按约定结构输出，没有自行加章节、加开场白、加结尾寒暄？',
    '把这份答案交给一个挑剔的同行，他会最先挑哪一处毛病？先改掉它'
  ];

  var GUARD_TEXT =
    '遇到不确定的信息，明确写「不确定」，并说明需要什么才能确定。\n' +
    '禁止编造数据、引文、法条、文献、版本号、API 名、人名。\n' +
    '如果某一部分你确实没有可靠依据，直接说「这部分我没有可靠依据」，' +
    '不要用看起来合理的句子填空。';

  /* ======================= 2. 工具函数 ======================= */

  function $(sel) { return document.querySelector(sel); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ======================= 3. 分析 ======================= */

  var DIMS = [
    { key: 'task',       label: '任务明确度', w: 22 },
    { key: 'role',       label: '角色视角',   w: 12 },
    { key: 'context',    label: '背景信息',   w: 18 },
    { key: 'constraint', label: '约束条件',   w: 20 },
    { key: 'format',     label: '输出格式',   w: 18 },
    { key: 'example',    label: '示例锚点',   w: 10 }
  ];

  function scoreDims(raw) {
    var n = raw.replace(/\s/g, '').length;
    var hasNum = /\d/.test(raw);
    var has = function (re) { return re.test(raw); };

    return {
      task: clamp(
        26 + (n >= 12 ? 16 : 0) + (n >= 40 ? 14 : 0) + (hasNum ? 16 : 0) +
        (has(/(写|做|生成|分析|设计|改|翻译|优化|整理|对比|规划|拆解|评估|检查|实现|帮(我|忙))/) ? 18 : 0) +
        (has(/(要|需要|希望|想|目标|目的)/) ? 10 : 0), 0, 100),

      role: has(/(你是|作为一个|扮演|以.{0,8}的身份|act as|you are)/i) ? 85
          : has(/(专家|工程师|老师|教练|顾问|律师|医生|设计师|产品经理|分析师)/) ? 45 : 12,

      context: clamp(
        10 + (n >= 30 ? 16 : 0) + (n >= 80 ? 14 : 0) +
        (has(/(背景|因为|目前|现在|我在|我们|客户|用户|读者|受众|目标|场景|已经|之前|最近)/) ? 26 : 0) +
        (hasNum ? 12 : 0), 0, 100),

      constraint: clamp(
        8 + (has(/(不要|禁止|避免|必须|只能|务必|最多|至少|不超过|限制|不能|要求|别用|不许)/) ? 40 : 0) +
        (has(/(字|条|个|页|分钟|%|元|岁|人)/) ? 16 : 0) +
        (has(/(不超过|最多|至少|以内|以下)/) ? 22 : 0), 0, 100),

      format: clamp(
        8 + (has(/(格式|markdown|表格|列表|分点|结构|json|标题|段落|输出|返回|呈现|排版|要点)/i) ? 42 : 0) +
        (has(/(表格|json|分点|列表|大纲|代码块|流程图)/i) ? 22 : 0), 0, 100),

      example: has(/(例如|比如|示例|样例|参考|示范|类似|像.{0,6}这样|for example|e\.g\.)/i) ? 78 : 5
    };
  }

  function totalScore(d) {
    var s = 0;
    for (var i = 0; i < DIMS.length; i++) s += d[DIMS[i].key] * DIMS[i].w / 100;
    return Math.round(s);
  }

  /* 命中数相同时按这个顺序优先：越靠前越"专"。
     writing 故意放最后 —— 「写」这个字几乎每个需求里都有，最容易抢戏。 */
  var TYPE_ORDER = ['translate', 'code', 'review', 'analyze', 'decide', 'learn', 'office', 'creative', 'writing'];

  function detectType(raw) {
    var best = 'general', bestN = 0, k, t, n, w, i, j;
    var lower = raw.toLowerCase();
    for (j = 0; j < TYPE_ORDER.length; j++) {
      k = TYPE_ORDER[j];
      t = TYPES[k];
      if (!t || !t.kw || !t.kw.length) continue;
      n = 0;
      for (i = 0; i < t.kw.length; i++) {
        w = t.kw[i];
        if (lower.indexOf(w.toLowerCase()) >= 0) n++;
      }
      if (n > bestN) { bestN = n; best = k; }
    }
    return bestN > 0 ? best : 'general';
  }

  function extract(raw) {
    var e = {}, m;
    if ((m = raw.match(/(小红书|公众号|抖音|视频号|B站|b站|知乎|微博|朋友圈|快手|淘宝|京东|官网|邮件|周报|日报)/))) e.platform = m[1];
    if ((m = raw.match(/(\d{1,6})\s*(?:字|words?)(?:以内|以下|左右|以上)?/i))) e.words = m[0].replace(/\s+/g, '');
    if ((m = raw.match(/(英文|英语|日文|日语|中文|繁体|法语|德语|西语|西班牙语)/))) e.lang = m[1];
    if ((m = raw.match(/\b(Python|JavaScript|TypeScript|Java|Go|Golang|Rust|C\+\+|C#|SQL|PHP|Node\.js|React|Vue|MySQL|PostgreSQL|Redis)\b/i))) e.tech = m[1];
    if ((m = raw.match(/(?:面向|针对|给)\s*([\u4e00-\u9fa5A-Za-z]{2,12}?)(?:看|用|写|读|听|，|,|。|$)/))) e.audience = m[1];
    return e;
  }

  var PROBES = {
    platform: function (r, e) {
      var bits = [];
      if (e.platform) bits.push(e.platform);
      if (e.words) bits.push(e.words);
      return bits.length ? bits.join('，') : null;
    },
    words:    function (r, e) { return e.words || null; },
    lang:     function (r, e) { return e.lang || null; },
    tech:     function (r, e) { return e.tech || null; },
    audience: function (r, e) { return e.audience || null; }
  };

  function probeOf(slot, raw, e) {
    var f = PROBES[slot.k];
    return f ? f(raw, e) : null;
  }

  /* ======================= 4. 生成 ======================= */

  var MD_TITLES = {
    role: '角色', task: '任务', context: '背景与上下文', rules: '硬性要求',
    format: '输出格式', selfcheck: '输出前的自检', guard: '不确定时怎么办',
    example: '参考示例', ask: '开始之前', start: '开始'
  };

  var XML_TAGS = {
    role: 'role', task: 'task', context: 'context', rules: 'constraints',
    format: 'output_format', selfcheck: 'self_check', guard: 'guardrails',
    example: 'examples', ask: 'clarify_first', start: 'begin'
  };

  function fmtList(items) {
    return items.map(function (x, i) { return (i + 1) + '. ' + x; }).join('\n');
  }

  function renderPrompt(sec, style) {
    var order = ['role', 'task', 'context', 'rules', 'format', 'selfcheck', 'guard', 'example', 'ask', 'start'];
    var out = [];
    for (var i = 0; i < order.length; i++) {
      var key = order[i];
      if (!sec[key]) continue;
      if (style === 'xml') {
        out.push('<' + XML_TAGS[key] + '>\n' + sec[key] + '\n</' + XML_TAGS[key] + '>');
      } else {
        out.push('## ' + MD_TITLES[key] + '\n' + sec[key]);
      }
    }
    return out.join('\n\n') + '\n';
  }

  function forge(cfg) {
    var raw = cfg.raw.trim();
    var typeKey = cfg.type === 'auto' ? detectType(raw) : cfg.type;
    if (typeKey === 'general' || !TYPES[typeKey]) typeKey = TYPES[typeKey] ? typeKey : 'auto';
    var t = TYPES[typeKey] || TYPES.auto;
    var model = MODELS[cfg.model] || MODELS.generic;
    var tone = TONES[cfg.tone] || TONES.pro;
    var det = DETAILS[cfg.detail] || DETAILS.normal;
    var e = extract(raw);

    /* ---- 背景槽位 ---- */
    var bullets = [];
    var missing = [];
    var found = 0;
    for (var i = 0; i < t.slots.length; i++) {
      var s = t.slots[i];
      var v = probeOf(s, raw, e);
      if (v) { found++; } else { missing.push(s.ask); }
      bullets.push('- ' + s.ask + '：' + (v || '（待填写）'));
    }
    bullets.push('- 已有材料 / 参考：[把相关资料、数据、链接贴在这里]');

    /* ---- 硬性要求 ---- */
    var rules = [];
    for (var j = 0; j < t.rules.length; j++) rules.push(t.rules[j]);
    rules.push(tone.line);
    rules.push(det.line);
    rules.push('输出语言：' + (e.lang && /英文|英语/.test(e.lang) ? '英文' : '中文') + '；所有内容直接进入正题，不要寒暄');
    if (cfg.model === 'claude') rules.push('把内容放进 XML 标签里；标签之外不要写任何客套话');
    if (cfg.model === 'deepseek') rules.push('指令保持紧凑，不要解释你的角色设定，不要用花哨排版');
    if (cfg.model === 'local') rules.push('只用短句和短语，避免长段落与复杂嵌套，一次只做一件明确的动作');
    if (cfg.model === 'gemini') rules.push('关键步骤用编号列出，方便我逐步核对');

    /* ---- 各段 ---- */
    var sec = {};
    sec.role = t.role;
    sec.task = '请交付：' + t.deliver + '。\n\n' +
               '我的原始需求（原话，信息以此为准，不要改写、不要删减）：\n' +
               '【' + raw + '】';
    sec.context = bullets.join('\n');
    sec.rules = fmtList(rules);
    sec.format = t.format + '\n\n直接给成品。不要写「好的，我来帮你……」这类开场白；结尾不要问我「还需要什么吗」。';
    if (cfg.selfCheck) {
      sec.selfcheck = '输出前逐条核对，任一条不通过就自己重写，不要把不合格的版本发给我：\n' +
                      fmtList(t.checks.concat(UNIVERSAL_CHECKS));
    }
    if (cfg.guard) sec.guard = GUARD_TEXT;
    if (cfg.example) {
      sec.example = '【输入示例】\n（贴一个你满意的例子）\n\n【期望输出】\n（贴对应的输出）\n\n' +
                    '请模仿上例的判断标准和表达密度，但不要照抄具体内容。';
    }
    if (cfg.ask) {
      if (missing.length) {
        sec.ask = '我上面有 ' + missing.length + ' 处信息还没填（标了「待填写」）。\n' +
                  '请先在开头列出最多 3 个最关键的问题向我确认，不要猜、不要编；等我回答后再开始写。';
      } else {
        sec.ask = '如果对我的要求有任何理解上的不确定，先用最多 3 个问题确认，不要靠猜开始。';
      }
    }
    sec.start = '现在开始。第一步用一句话复述你对任务的理解（只复述，不展开）；第二步直接交付成品。';

    var md = renderPrompt(sec, model.style);

    /* ---- 评分 ---- */
    var d = scoreDims(raw);
    var before = totalScore(d);
    var after = clamp(Math.round(91 + found * 1.2 - missing.length * 1.8), 60, 97);

    /* ---- 改进说明 ---- */
    var reasons = [];
    if (d.role < 50) reasons.push('补了角色锚定：模型知道「谁在说话」，输出风格会稳很多，不再一会儿正经一会儿活泼');
    if (d.context < 50) reasons.push('补了背景槽位：AI 不用靠猜，胡编的概率明显下降');
    if (d.constraint < 50) reasons.push('把「别写废话」变成了可检查的条款：数量、禁用词、边界都写死了');
    if (d.format < 50) reasons.push('约定了交付形状：省掉你后面「再按这个格式重排一遍」那一轮');
    reasons.push('加了输出前自检：这是提升「一次就过」概率最有效的一条');
    if (cfg.guard) reasons.push('加了反编造条款：不确定就说不确定，不再一本正经地胡说');

    return {
      md: md,
      typeKey: typeKey,
      typeLabel: TYPES[typeKey].label,
      before: before,
      after: after,
      missing: missing,
      dims: d,
      reasons: reasons.slice(0, 5),
      opts: cfg
    };
  }

  /* ======================= 5. 渲染 ======================= */

  function inline(s) {
    return s
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[待填写[^\]]*\]|（待填写）/g, '<span class="missing">$&</span>');
  }

  function mdToHtml(md) {
    var lines = md.split('\n');
    var out = '';
    var mode = null;

    function close() {
      if (mode === 'ul') out += '</ul>';
      else if (mode === 'ol') out += '</ol>';
      mode = null;
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/\s+$/, '');
      if (!line.trim()) { close(); continue; }

      if (/^#{1,3}\s+/.test(line)) {
        close();
        out += '<h3>' + inline(esc(line.replace(/^#{1,3}\s+/, ''))) + '</h3>';
        continue;
      }
      if (/^[-*]\s+/.test(line)) {
        if (mode !== 'ul') { close(); out += '<ul>'; mode = 'ul'; }
        out += '<li>' + inline(esc(line.replace(/^[-*]\s+/, ''))) + '</li>';
        continue;
      }
      if (/^\d+\.\s+/.test(line)) {
        if (mode !== 'ol') { close(); out += '<ol>'; mode = 'ol'; }
        out += '<li>' + inline(esc(line.replace(/^\d+\.\s+/, ''))) + '</li>';
        continue;
      }
      close();
      out += '<p>' + inline(esc(line)) + '</p>';
    }
    close();
    return out;
  }

  /* ======================= 6. 状态 ======================= */

  var state = { md: '', view: 'pretty', result: null };
  var LS_KEY = 'promptforge.last';

  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, 1900);
  }

  function setScore(visible, before, after) {
    var bar = $('#scorebar');
    if (!visible) { bar.hidden = true; return; }
    bar.hidden = false;
    $('#numBefore').textContent = before;
    $('#numAfter').textContent = after;
    $('#barBefore').style.width = before + '%';
    $('#barAfter').style.width = after + '%';
  }

  function renderOutput(result) {
    state.result = result;
    state.md = result.md;
    paint();

    setScore(true, result.before, result.after);

    var rep = $('#report');
    var html = '<div class="report-title">为什么这样改更准</div><ul>';
    for (var i = 0; i < result.reasons.length; i++) html += '<li>' + esc(result.reasons[i]) + '</li>';
    html += '</ul>';
    if (result.missing.length) {
      html += '<div class="todo">还有 ' + result.missing.length + ' 处没填，补齐后效果差别很大：<br>' +
              result.missing.map(function (m) { return '· ' + esc(m); }).join('<br>') + '</div>';
    }
    rep.innerHTML = html;
    rep.hidden = false;

    $('#btnCopy').disabled = false;
    $('#btnDownload').disabled = false;
    $('#btnJson').disabled = false;
  }

  function paint() {
    var body = $('#outputBody');
    if (!state.md) {
      body.innerHTML = '<div class="empty"><div class="empty-icon">⚒</div>' +
        '<p>左边写点东西，点「锻造提示词」。</p>' +
        '<p class="small">不用写得规范，越像跟同事随口说，效果越好。</p></div>';
      return;
    }
    if (state.view === 'pretty') {
      body.innerHTML = '<div class="md">' + mdToHtml(state.md) + '</div>';
    } else {
      body.innerHTML = '<textarea class="raw-out" id="rawOut" spellcheck="false"></textarea>';
      var ta = $('#rawOut');
      ta.value = state.md;
      ta.addEventListener('input', function () { state.md = ta.value; });
    }
  }

  /* ======================= 7. 初始化 ======================= */

  function fillSelect(sel, map, def) {
    var html = '';
    for (var k in map) {
      if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
      html += '<option value="' + k + '">' + esc(map[k].label) + '</option>';
    }
    sel.innerHTML = html;
    if (def) sel.value = def;
  }

  function renderTemplates(filter) {
    var grid = $('#tplGrid');
    var q = (filter || '').trim().toLowerCase();
    var list = TEMPLATES.filter(function (t) {
      if (!q) return true;
      return (t.name + t.desc + t.tags + t.raw).toLowerCase().indexOf(q) >= 0;
    });
    grid.innerHTML = list.map(function (t) {
      return '<button class="tpl" data-id="' + t.id + '">' +
        '<span class="tpl-icon">' + t.icon + '</span>' +
        '<span><span class="tpl-name">' + esc(t.name) + '</span>' +
        '<span class="tpl-desc">' + esc(t.desc) + '</span></span></button>';
    }).join('');
    $('#tplEmpty').hidden = list.length > 0;
  }

  function readCfg() {
    return {
      raw: $('#raw').value,
      type: $('#type').value,
      model: $('#model').value,
      tone: $('#tone').value,
      detail: $('#detail').value,
      selfCheck: $('#optSelfCheck').checked,
      ask: $('#optAsk').checked,
      guard: $('#optGuard').checked,
      example: $('#optExample').checked
    };
  }

  function saveCfg() {
    try {
      var c = readCfg();
      if (!c.raw.trim()) return;
      localStorage.setItem(LS_KEY, JSON.stringify(c));
    } catch (err) { /* 隐私模式下忽略 */ }
  }

  function loadCfg() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var c = JSON.parse(raw);
      if (c.raw) $('#raw').value = c.raw;
      if (c.type && TYPES[c.type]) $('#type').value = c.type;
      if (c.model && MODELS[c.model]) $('#model').value = c.model;
      if (c.tone && TONES[c.tone]) $('#tone').value = c.tone;
      if (c.detail && DETAILS[c.detail]) $('#detail').value = c.detail;
      if (typeof c.selfCheck === 'boolean') $('#optSelfCheck').checked = c.selfCheck;
      if (typeof c.ask === 'boolean') $('#optAsk').checked = c.ask;
      if (typeof c.guard === 'boolean') $('#optGuard').checked = c.guard;
      if (typeof c.example === 'boolean') $('#optExample').checked = c.example;
    } catch (err) { /* 忽略损坏数据 */ }
  }

  function countRaw() {
    var n = $('#raw').value.trim().length;
    $('#rawCount').textContent = n + ' 字';
  }

  function doForge() {
    var cfg = readCfg();
    if (!cfg.raw.trim()) {
      toast('先在左边写点东西');
      $('#raw').focus();
      return;
    }
    var result = forge(cfg);
    state.view = 'pretty';
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-view') === 'pretty');
    }
    renderOutput(result);
    saveCfg();
    var out = $('.panel-output') || document.querySelectorAll('.layout .panel')[1];
    if (out && window.innerWidth < 900) {
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function copyAll() {
    if (!state.md) return;
    var text = state.md;
    var done = function () { toast('已复制，直接粘给 AI'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); }
    catch (err) { toast('复制失败，请切到「源码」手动全选'); }
    document.body.removeChild(ta);
  }

  function download(name, text) {
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function stamp() {
    var d = new Date();
    var p = function (v) { return (v < 10 ? '0' : '') + v; };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' +
           p(d.getHours()) + p(d.getMinutes());
  }

  function init() {
    fillSelect($('#type'), (function () {
      var o = {};
      for (var k in TYPES) if (Object.prototype.hasOwnProperty.call(TYPES, k)) {
        o[k] = { label: TYPES[k].icon + ' ' + TYPES[k].label };
      }
      return o;
    })(), 'auto');
    fillSelect($('#model'), MODELS, 'generic');
    fillSelect($('#tone'), TONES, 'plain');
    fillSelect($('#detail'), DETAILS, 'normal');

    renderTemplates('');
    loadCfg();
    countRaw();

    /* 主题 */
    var saved = null;
    try { saved = localStorage.getItem('promptforge.theme'); } catch (e) {}
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    $('#btnTheme').textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '☀️' : '🌙';

    if (REPO_URL) {
      var link = $('#repoLink');
      if (link) { link.href = REPO_URL; link.textContent = 'GitHub 仓库'; }
    }
    var mainRepo = document.getElementById('repoLink');
    if (!REPO_URL && mainRepo) mainRepo.style.display = 'none';

    /* ---- 事件 ---- */
    $('#raw').addEventListener('input', countRaw);
    $('#btnForge').addEventListener('click', doForge);

    $('#btnSample').addEventListener('click', function () {
      var t = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
      $('#raw').value = t.raw;
      $('#type').value = t.type;
      countRaw();
      twinkle('#raw');
    });

    $('#btnClear').addEventListener('click', function () {
      $('#raw').value = '';
      $('#raw').focus();
      countRaw();
      state.md = '';
      setScore(false);
      $('#report').hidden = true;
      $('#btnCopy').disabled = true;
      $('#btnDownload').disabled = true;
      $('#btnJson').disabled = true;
      paint();
    });

    document.addEventListener('keydown', function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
        ev.preventDefault();
        doForge();
      }
    });

    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var v = this.getAttribute('data-view');
        if (v === state.view) return;
        state.view = v;
        for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
        this.classList.add('active');
        paint();
      });
    }

    $('#btnCopy').addEventListener('click', copyAll);

    $('#btnDownload').addEventListener('click', function () {
      if (!state.md) return;
      download('promptforge-' + (state.result ? state.result.typeKey : 'prompt') + '-' + stamp() + '.md', state.md);
      toast('已下载 .md 文件');
    });

    $('#btnJson').addEventListener('click', function () {
      if (!state.result) return;
      var r = state.result;
      var data = {
        tool: 'PromptForge',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        type: { key: r.typeKey, label: r.typeLabel },
        score: { before: r.before, after: r.after },
        options: r.opts,
        pending: r.missing,
        prompt: r.md
      };
      download('promptforge-' + stamp() + '.json', JSON.stringify(data, null, 2));
      toast('已导出 .json');
    });

    /* 模板库 */
    $('#tplGrid').addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('.tpl') : null;
      if (!btn) return;
      var id = btn.getAttribute('data-id');
      var t = null;
      for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].id === id) t = TEMPLATES[i];
      if (!t) return;
      $('#raw').value = t.raw;
      $('#type').value = t.type;
      countRaw();
      twinkle('#raw');
      $('#raw').scrollIntoView({ behavior: 'smooth', block: 'center' });
      $('#raw').focus();
      toast('已填入模板：' + t.name);
    });

    $('#tplSearch').addEventListener('input', function () {
      renderTemplates(this.value);
    });

    /* 弹窗 */
    var dlg = $('#helpDialog');
    $('#btnHelp').addEventListener('click', function () {
      if (dlg.showModal) dlg.showModal();
      else dlg.setAttribute('open', '');
    });
    $('#btnHelpClose').addEventListener('click', function () {
      if (dlg.close) dlg.close();
      else dlg.removeAttribute('open');
    });
    dlg.addEventListener('click', function (ev) {
      if (ev.target === dlg) dlg.close();
    });

    /* 主题切换 */
    $('#btnTheme').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      this.textContent = next === 'light' ? '☀️' : '🌙';
      try { localStorage.setItem('promptforge.theme', next); } catch (e) {}
    });

    /* 首屏给个示例，避免空白 */
    if (!$('#raw').value) {
      $('#raw').placeholder = '随便写，不用讲礼貌、不用组织语言。\n\n例：帮我写个小红书笔记，介绍我们家的护眼台灯\n例：这个函数老是报错，帮我看看怎么回事';
    }
  }

  function twinkle(sel) {
    var el = $(sel);
    el.style.transition = 'border-color .2s';
    el.style.borderColor = 'var(--accent)';
    setTimeout(function () { el.style.borderColor = ''; }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
