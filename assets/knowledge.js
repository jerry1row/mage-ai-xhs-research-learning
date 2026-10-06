(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const iconPaths = {
    arrow:'<path d="M4 12h15m-5-5 5 5-5 5"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    book:'<path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Zm0 0v15"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/>',
    star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
    close:'<path d="m5 5 14 14M19 5 5 19"/>',
    edit:'<path d="m4 16-1 5 5-1L20 8l-4-4ZM14 6l4 4"/>',
    chart:'<path d="M4 3v17h17M8 15v-4m5 4V6m5 9V9"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  const icon = name => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(iconPaths[name]||iconPaths.arrow)+'</svg>';
  const node = (title,text,label='') => '<div class="diagram-node">'+(label?'<span class="diagram-label">'+escape(label)+'</span>':'')+'<strong>'+escape(title)+'</strong><p>'+escape(text)+'</p></div>';
  const frame = (caption,inner,tag='先看关系，再读方法') => '<figure class="knowledge-figure"><figcaption><span>知识图解</span><strong>'+escape(caption)+'</strong><small>'+escape(tag)+'</small></figcaption>'+inner+'</figure>';
  const path = (items, cls='') => '<div class="path-diagram '+cls+'">'+items.map((a,i)=>node(a[0],a[1],String(i+1).padStart(2,'0'))+(i<items.length-1?'<span class="path-arrow" aria-hidden="true">→</span>':'')).join('')+'</div>';
  const figures = {
    audiences: () => frame('人群 × 任务 × 结果','<div class="persona-map">'+[
      ['起步创作者','从没有选题，到做出第一篇自己的内容','研究表、选题步骤与填表示范'],
      ['一人经营者','从重复劳动，到一项稳定的经营流程','客户问答、内容或经营SOP'],
      ['AI进阶创作者','从一次操作，到第二次也能复用','Skill、输入规范与验收说明']
    ].map((a,i)=>'<div class="persona-row"><span class="persona-number">0'+(i+1)+'</span><div><strong>'+a[0]+'</strong><p>'+a[1]+'</p></div><span class="persona-output">'+a[2]+'</span></div>').join('')+'</div><div class="diagram-conclusion">每篇内容先服务一个主要角色，交付一个清楚的结果。</div>'),
    research: () => frame('九个观察镜头，汇成一个决定','<div class="research-map">'+[
      ['用户','谁在什么场景下卡住'],['搜索','他怎样描述问题'],['供给','什么内容讲得多、什么没讲清'],['账号','谁在持续服务相同人群'],['笔记','用什么结构与证据'],['商品','买什么、哪里不好用'],['品牌','采购哪些受众与任务'],['趋势','供需正在怎样变化'],['自身','自己的结果与投入如何']
    ].map((a,i)=>'<button class="lens" data-lens="'+i+'" data-description="'+escape(a[1])+'"><span>0'+(i+1)+'</span><strong>'+a[0]+'</strong></button>').join('')+'</div><div class="lens-result" aria-live="polite">点一个观察镜头，明确下一步要问的问题。</div>','点击九个镜头查看问题'),
    keywords: () => frame('从角色出发，组合搜索词','<div class="keyword-workshop"><label>人群<select data-key-role><option>内容创作者</option><option>个人IP</option><option>一人经营者</option><option>AI进阶创作者</option></select></label><label>任务<select data-key-task><option>选题</option><option>脚本</option><option>封面</option><option>客户问答</option><option>素材整理</option></select></label><label>卡点<select data-key-pain><option>不会开始</option><option>结果不稳定</option><option>无法复用</option><option>使用条件</option></select></label></div><div class="keyword-result" data-key-result aria-live="polite"></div><p class="figure-note">组合词是调查种子，热度与购买需求还需要样本验证。</p>','选择三个切面，生成调查入口'),
    counterparts: () => frame('同一个账号，可以承担不同的学习角色','<div class="counterpart-map">'+[
      ['同受众','学问题与用户语言','受众任务与预算相近'],['同阶段','学能执行的生产方式','资源与制作条件接近'],['元素','学一个具体表达动作','开头、内页、镜头或演示'],['商业','学规格与交易承接','商品或合作路径可见'],['进阶','学长期能力与质量','把不可复用条件写清']
    ].map((a,i)=>'<div><span class="mini-index">0'+(i+1)+'</span><strong>'+a[0]+'</strong><p>'+a[1]+'</p><small>'+a[2]+'</small></div>').join('')+'</div><div class="diagram-conclusion">粉丝量帮助分层。真正要核验的是任务、完整内容与近期常态。</div>'),
    breakdown: () => frame('图文与视频，按信息职责拆解','<div class="segment-control" aria-label="选择拆解形式"><button data-breakdown="graphic" aria-pressed="true">图文逐页</button><button data-breakdown="video" aria-pressed="false">视频分段</button></div><div data-breakdown-body></div>','切换形式查看拆解路线'),
    demand: () => frame('需求证据逐层增强','<div class="demand-ladder">'+[
      ['兴趣表达','喜欢这个主题，尚未说明任务'],['明确问题','说出实际场景、失败或条件'],['实际试用','开始做，并留下使用反馈'],['真实支付','在明确规格下发生交易'],['重复使用','能持续使用、复购或转介']
    ].map((a,i)=>'<div style="--level:'+i+'"><span>0'+(i+1)+'</span><strong>'+a[0]+'</strong><p>'+a[1]+'</p></div>').join('')+'</div><div class="diagram-conclusion">「求资料」是进一步获取意愿。支付与使用还要另外验证。</div>'),
    matrix: () => frame('看供需关系，再决定下一步','<div class="matrix-label"><span>内容供给与解决程度</span><span>用户需求证据</span></div><div class="supply-matrix">'+[
      ['需求明确 · 方案不足','优先验证小解决方案','在重要失败点或使用体验上补足。'],
      ['需求明确 · 同质密集','寻找有用差异','人群、可靠性、示例或验收做深。'],
      ['需求不清 · 内容很多','先核查用户','可能是创作者集中追热点。'],
      ['需求不清 · 内容很少','小调查先行','空白也可能没有人需要。']
    ].map(a=>'<button data-matrix="'+escape(a[1])+'" data-reason="'+escape(a[2])+'"><small>'+a[0]+'</small><strong>'+a[1]+'</strong><p>'+a[2]+'</p></button>').join('')+'</div><div class="matrix-result" aria-live="polite">点击一个象限，选择适合的调查动作。</div>','方法示意，非实时市场数据'),
    evidence: () => frame('先过三类证据，再用评分排序','<div class="evidence-triad">'+[
      ['表现','相近受众的内容，或自己的数据，有可比较表现。'],
      ['需求','有明确问题、失败、咨询、试用或购买记录。'],
      ['匹配','读者需要，你能提供自己的证据，并符合账号目标。']
    ].map((a,i)=>'<label><input type="checkbox" data-evidence="'+i+'"><span class="evidence-symbol">0'+(i+1)+'</span><strong>'+a[0]+'证据</strong><p>'+a[1]+'</p></label>').join('')+'</div><div class="evidence-decision" data-evidence-decision aria-live="polite"></div><details class="score-lab"><summary>试算一个选题的优先级</summary><p class="figure-note">每项1—5分；权重是教学建议，不是爆款概率。需要实际依据。</p><div class="score-inputs">'+[
      ['需求','25%',5],['匹配','20%',4],['表现','15%',3],['差异','15%',3],['可行性','15%',3],['时机','10%',2]
    ].map((a,i)=>'<label><span>'+a[0]+'<small>'+a[1]+'</small></span><input aria-label="'+a[0]+'分数" type="range" min="1" max="5" value="3" data-score="'+i+'" data-weight="'+a[2]+'"><output>3</output></label>').join('')+'</div><div class="score-result" data-score-result aria-live="polite"></div></details>','勾选已取得的证据，查看判断'),
    promise: () => frame('三处表达，兑现同一个结果',path([['标题','说清任务、结果和真实条件'],['封面','展示成品、对照或关键问题'],['正文','给步骤、证据、检查和下一步']])+'<div class="title-lab"><label for="title-practice">标题练习</label><textarea id="title-practice" rows="2" data-title-count>把爆款笔记变成你的选题这套AI流程就够用</textarea><span data-title-result aria-live="polite"></span></div>','20字符练习，发布按后台计数'),
    timeline: () => frame('让语言、操作和画面一起推进','<div class="video-timeline">'+[
      ['0—8秒','看见结果','真实成品或前后对照'],['8—20秒','确认任务','原始材料或失败现象'],['20—80秒','完成动作','关键输入、操作和输出'],['80—110秒','检查与修正','核对、修改和复测'],['110—150秒','开始复用','条件、清单和下一步']
    ].map((a,i)=>'<div><span>'+a[0]+'</span><b>0'+(i+1)+'</b><strong>'+a[1]+'</strong><p>'+a[2]+'</p></div>').join('')+'</div><p class="figure-note">这是教学节奏参考，实际时长取决于任务复杂度与录制。</p>'),
    sources: () => frame('六类素材，共同支持一次可信的演示','<div class="source-map">'+[
      ['问题','评论、咨询、售后','记录实际任务与原话'],['知识','官方文档与更新','核对功能、版本与条件'],['方法','完整教程和实战','提炼判断、步骤与反例'],['操作','自己的实际任务','保存输入、失败与修正'],['结果','自己的可验证输出','保留文件、检查与反馈'],['表达','完整对标与许可素材','学习职责，核对使用权']
    ].map(a=>node(a[0],a[1]+' · '+a[2])).join('')+'</div><div class="diagram-conclusion">每张素材卡都有来源、日期、条件、使用权与自己的验证。</div>'),
    brand: () => frame('把商务变成可交付的流程',path([['适配与试用','受众和任务是否匹配'],['Brief与范围','交付、修改、授权与档期'],['真实制作','操作、结果与使用条件'],['审核与结算','按实际流程完成合作'],['复盘与复投','净收益、工时与真实效果']])+'<div class="diagram-conclusion">合作资格、费用与到账时间，以实时账户和订单条件为准。</div>'),
    product: () => frame('一个小产品，交付一项完整任务','<div class="product-canvas">'+[
      ['谁在使用','具体人群与触发场景'],['要完成什么','从输入到可核验输出'],['现有方案卡在哪','使用门槛、失败或不完整'],['你补足什么','步骤、示例、可靠性与复用'],['怎么验收','新用户能否独立完成']
    ].map((a,i)=>'<div><span>0'+(i+1)+'</span><strong>'+a[0]+'</strong><p>'+a[1]+'</p></div>').join('')+'</div><div class="diagram-conclusion">先检查现有产品，做一个最小样品，试跑后再扩展。</div>'),
    delivery: () => frame('从看到笔记，到真正用起来',path([['相关笔记','任务与产品自然关联'],['对应SKU','具体包含与展示价'],['平台下单','实际权限与规则'],['约定交付','可访问的真实内容'],['使用与支持','说明、检查与售后']])+'<p class="figure-note">具体类目、资格、商品关联和交付方式，需要实时后台核验。</p>'),
    funnel: () => frame('同口径漏斗，定位真正的卡点','<p class="figure-note">初始值为教学模拟，可以修改。本例每位买家一单；退款按订单计算。</p><div class="funnel-inputs">'+[
      ['阅读人数','reads','2000'],['商品点击人数','clicks','100'],['支付买家数','buyers','4'],
      ['支付订单数','orders','4'],['可归因销售额（元）','revenue','199.6'],['退款订单数','refunds','1']
    ].map(a=>'<label>'+a[0]+'<input aria-label="'+a[0]+'" type="number" min="0" step="'+(a[1]==='revenue'?'0.1':'1')+'" value="'+a[2]+'" data-funnel="'+a[1]+'"></label>').join('')+'</div><div class="funnel-results" data-funnel-results aria-live="polite"></div><p class="figure-note">未知留空；0分母不计算。自然与投放、人数与次数、时间窗口不能混用。</p>','教学数据，可修改练习'),
    loop: () => frame('每周运行一次学习闭环',path([['观察','更新固定关键词与需求'],['拆解','取得完整材料与反例'],['实测','用自己的材料跑一次'],['制作','兑现标题与结果'],['复盘','根据反馈改善一个环节']])+'<div class="diagram-conclusion">每次学习，留下一个决定、一个动作和一条验证。</div>')
  };

  function attach(root) {
    const $ = selector => root.querySelector(selector);
    const $$ = selector => [...root.querySelectorAll(selector)];
    $$('[data-lens]').forEach(btn=>btn.addEventListener('click',()=>{
      $$('[data-lens]').forEach(b=>b.classList.toggle('selected',b===btn));
      $('.lens-result').textContent=btn.querySelector('strong').textContent+'：'+btn.dataset.description;
    }));
    if ($('[data-key-result]')) {
      const update=()=>{$('[data-key-result]').innerHTML='<span>调查种子</span><strong>'+escape($('[data-key-role]').value+' + AI + '+$('[data-key-task]').value+' + '+$('[data-key-pain]').value)+'</strong><p>再找近期内容、完整材料与评论，验证这个问题是否值得做。</p>'};
      $$('[data-key-role],[data-key-task],[data-key-pain]').forEach(el=>el.addEventListener('change',update)); update();
    }
    if ($('[data-breakdown-body]')) {
      const show=mode=>{
        const items=mode==='graphic'?[['封面','识别人群与结果'],['确认问题','读者为什么继续看'],['步骤','输入、动作与输出'],['证据','核对、失败与修正'],['开始行动','条件、检查与下一步']]:[['结果预览','先看目标输出'],['任务背景','原材料与卡点'],['真实操作','画面与口播同步'],['检验结果','核对与人工处理'],['复用方式','第二任务与条件']];
        $('[data-breakdown-body]').innerHTML=path(items);
        $$('[data-breakdown]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.breakdown===mode)));
      }; $$('[data-breakdown]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.breakdown))); show('graphic');
    }
    $$('[data-matrix]').forEach(b=>b.addEventListener('click',()=>{$$('[data-matrix]').forEach(n=>n.classList.toggle('selected',n===b));$('.matrix-result').textContent=b.dataset.matrix+'：'+b.dataset.reason;}));
    if ($('[data-evidence-decision]')) {
      const update=()=>{
        const count=$$('[data-evidence]:checked').length;
        $('[data-evidence-decision]').innerHTML='<span class="decision-label">'+count+' / 3 类证据</span><strong>'+(count===3?'可以进入制作与小测试判断':'先补证据，保留在候选池')+'</strong>';
        let total=0; $$('[data-score]').forEach(s=>{total+=Number(s.value)*Number(s.dataset.weight);s.nextElementSibling.textContent=s.value;});
        let decision=total>=80?'优先小测试':total>=65?'补证或调整':'暂缓，优化问题与角度';
        if(count<3)decision='待验证：高分也不能补足缺失证据';
        $('[data-score-result]').innerHTML='<span>加权得分</span><strong>'+total+' <small>/ 100</small></strong><p>'+decision+'</p>';
      }; $$('[data-evidence],[data-score]').forEach(e=>e.addEventListener('input',update));update();
    }
    if ($('[data-title-count]')) {
      const update=()=>{$('[data-title-result]').textContent='当前 '+Array.from($('[data-title-count]').value).length+' 字符 · 标题仍需与实际结果一致。'};
      $('[data-title-count]').addEventListener('input',update);update();
    }
    if ($('[data-funnel-results]')) {
      const update=()=>{
        const v={}; $$('[data-funnel]').forEach(el=>{v[el.dataset.funnel]=el.value.trim()===''?null:Number(el.value);});
        const invalid=Object.values(v).some(n=>n!==null&&(!Number.isFinite(n)||n<0))
          || ['reads','clicks','buyers','orders','refunds'].some(k=>v[k]!==null&&!Number.isInteger(v[k]))
          || (v.clicks!==null&&v.reads!==null&&v.clicks>v.reads)
          || (v.buyers!==null&&v.clicks!==null&&v.buyers>v.clicks)
          || (v.refunds!==null&&v.orders!==null&&v.refunds>v.orders)
          || (v.orders!==null&&v.buyers!==null&&v.orders<v.buyers);
        if(invalid){$('[data-funnel-results]').innerHTML='<p class="input-error">请检查同口径数量：非负整数，点击不超过阅读，买家不超过点击，订单不少于买家，退款不超过订单。</p>';return;}
        const ratio=(n,d,scale=100)=>n===null||d===null?'未知':d===0?'不适用':((n/d)*scale).toFixed(1)+(scale===100?'%':'元');
        const values=[['商品点击率',ratio(v.clicks,v.reads),'点击人数 ÷ 阅读人数'],['支付转化率',ratio(v.buyers,v.clicks),'买家数 ÷ 点击人数'],['每千阅读销售额',ratio(v.revenue,v.reads,1000),'销售额 ÷ 阅读人数 × 1000'],['退款订单比例',ratio(v.refunds,v.orders),'退款订单 ÷ 支付订单']];
        $('[data-funnel-results]').innerHTML=values.map(a=>'<div><span>'+a[0]+'</span><strong>'+a[1]+'</strong><small>'+a[2]+'</small></div>').join('');
      }; $$('[data-funnel]').forEach(e=>e.addEventListener('input',update));update();
    }
  }
  window.Knowledge={render:chapter=>(figures[chapter.diagram]||figures.loop)(),attach,icon,escape};
})();
