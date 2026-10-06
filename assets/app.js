(() => {
  'use strict';
  const D = window.COURSE_DATA, K = window.Knowledge, e = K.escape, icon = K.icon;
  const root = document.getElementById('app');
  const STORE = 'mage-ai-research-learning-v1';
  const blank = {completed:[], notes:{}, highlights:[], days:[], answers:{}, last:'01', font:18};
  let state, persistent = true, selection = null, toastTimer;
  try { state = Object.assign({}, blank, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch { state = {...blank}; persistent=false; }
  state.completed = Array.isArray(state.completed) ? state.completed.filter(id=>D.chapters.some(c=>c.id===id)) : [];
  state.highlights = Array.isArray(state.highlights) ? state.highlights.filter(h=>h&&typeof h.quote==='string'&&h.quote.length<=600) : [];
  state.days = Array.isArray(state.days) ? state.days.filter(n=>Number.isInteger(n)&&n>=1&&n<=30) : [];
  state.notes = state.notes && typeof state.notes==='object' && !Array.isArray(state.notes) ? state.notes : {};
  state.answers = state.answers && typeof state.answers==='object' ? state.answers : {};
  state.font = [17,18,20].includes(state.font) ? state.font : 18;
  const save = () => {try {localStorage.setItem(STORE,JSON.stringify(state));} catch {persistent=false;}};
  const chapter = id => D.chapters.find(c=>c.id===id);
  const button = (text,action,cls='',args='') => '<button class="'+cls+'" data-action="'+action+'" '+args+'>'+text+'</button>';
  const link = (label,route,cls='') => '<a class="'+cls+'" href="#'+route+'">'+label+'</a>';
  const groupName = c => D.groups.find(g=>g.id===c.group).title;
  const count = () => state.completed.length;
  const getRoute = () => {
    let value;
    try { value = decodeURIComponent(location.hash.slice(1)||'home'); } catch { value='home'; }
    return /^lesson-\d{2}$/.test(value)&&chapter(value.slice(7)) ? {page:'lesson',id:value.slice(7)}
      : ['home','sources','prompts','templates','plan','example','notebook'].includes(value) ? {page:value} : {page:'home'};
  };
  let route = getRoute();

  function toast(text) {
    const box = document.getElementById('toast'); if(!box)return;
    box.textContent=text; box.classList.add('visible');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.classList.remove('visible'),2600);
  }
  function setTOC(items) {
    return '<aside class="page-toc" aria-label="本页目录"><p class="toc-label">本页内容</p>'+items.map(item=>button(e(item.title),'anchor','toc-link','data-target="'+item.id+'"')).join('')+
      '<div class="toc-practice"><strong>把观察变成行动</strong><p>留一个判断，补一份证据，再做一个小实验。</p>'+link('查看30天计划 '+icon('arrow'),'plan')+'</div></aside>';
  }
  function sidebar() {
    return '<aside class="curriculum" id="curriculum" aria-label="学习目录"><div class="sidebar-top">'+button(icon('search')+'<span>查找章节或问题</span><kbd>/</kbd>','search','search-trigger')+'</div>'+
      link(icon('book')+'入门导读','home','nav-link '+(route.page==='home'?'active':''))+
      D.groups.map(g=>'<section class="nav-group"><div class="nav-group-title"><strong>'+e(g.title)+'</strong><small>'+g.range+'</small></div>'+
        D.chapters.filter(c=>c.group===g.id).map(c=>link('<span class="nav-number">'+c.id+'</span><span>'+e(c.shortTitle)+'</span>'+(state.completed.includes(c.id)?'<span class="nav-done" aria-label="已完成">'+icon('check')+'</span>':''),'lesson-'+c.id,'nav-link '+(route.id===c.id?'active':''))).join('')+'</section>').join('')+
      '<section class="nav-group"><div class="nav-group-title"><strong>学习工具</strong></div>'+
      [['sources','来源与高手地图'],['example','一套完整示范'],['templates','12张研究表'],['prompts','8条分析提示词'],['plan','30天执行计划'],['notebook','我的学习记录']].map(a=>link(e(a[1]),a[0],'nav-link resource-link '+(route.page===a[0]?'active':''))).join('')+'</section>'+
      '<div class="sidebar-progress"><span>我的学习进度</span><strong>'+count()+' / 16</strong><progress value="'+count()+'" max="16" aria-label="章节完成进度"></progress></div></aside>';
  }
  function shell(page, toc) {
    return '<a class="skip-link" href="#main" data-action="skip">跳到正文</a><header class="site-header">'+link('<img src="assets/mage-logo.webp" alt="马哥赢创" width="44" height="44"><strong>马哥赢创</strong>','home','brand')+
      '<span class="header-description">研究方法学习册</span><nav class="header-navigation" aria-label="快捷入口">'+link('完整课程','home')+link('研究表','templates')+link('<i aria-hidden="true"></i>学习记录','notebook')+'</nav><div class="header-tools">'+button(icon('search')+'<span class="tool-label">搜索</span>','search','icon-button')+
      button('A<span>字号</span>','font','font-button','aria-label="调整正文字号"')+
      button(icon('menu')+'<span>目录</span>','menu','menu-button','aria-controls="curriculum" aria-expanded="false"')+'</div></header>'+
      '<div class="learning-layout">'+sidebar()+'<main id="main" tabindex="-1">'+page+'</main>'+setTOC(toc)+'</div>'+
      '<div class="drawer-shade" data-action="close-menu" aria-hidden="true"></div>'+
      '<button class="selection-button" id="mark-selection" data-action="highlight" hidden>'+icon('edit')+'标为重点</button>'+
      '<div id="toast" class="toast" role="status" aria-live="polite"></div>'+searchDialog()+
      '<footer class="site-footer"><span>马哥赢创 · '+e(D.edition)+'学习版</span><span>方法与历史案例需结合自己的实测。学习记录只保存在当前浏览器。</span></footer>';
  }
  function pageHeader(kicker,title,intro,extra='') {
    return '<header class="page-header"><p class="eyebrow">'+kicker+'</p><h1>'+title+'</h1>'+(intro?'<p class="page-intro">'+intro+'</p>':'')+extra+'</header>';
  }
  function home() {
    const resume=chapter(state.last)||D.chapters[0];
    const pathway=[['看见问题','02'],['收集证据','03'],['完整拆解','05'],['自己的实测','11'],['内容与产品','08'],['复盘','15']];
    return pageHeader('学习手册 / 入门导读','把AI博主做好，<br>从看清市场开始。',e(D.subtitle).replace('把每一次','<br>把每一次'),
      '<div class="hero-actions">'+link((count()?'继续第'+resume.id+'章':'从第01章开始')+' '+icon('arrow'),'lesson-'+(count()?resume.id:'01'),'button primary')+
      button('浏览完整课程','anchor','button secondary','data-target="course-catalog"')+'</div>')+
      '<section id="home-path" class="home-path"><p class="section-kicker">先建立一条完整的研究路线</p><div class="route-line">'+pathway.map((a,i)=>link('<span>0'+(i+1)+'</span><strong>'+a[0]+'</strong>','lesson-'+a[1],'route-step')).join('')+'</div></section>'+
      '<section id="home-evidence" class="home-evidence"><div class="section-heading"><h2>选题，先过三道证据门。</h2><span>点一点，练习如何判断</span></div>'+K.render({diagram:'evidence'})+'</section>'+
      '<section id="home-first" class="first-practice"><span class="practice-index">第一次练习</span><h2>先研究一个任务，做出自己的判断。</h2><p>选一个创作者的实际问题，取得完整内容，找评论中的卡点，再用自己的材料实测。把结果保存为一张能复查的研究卡。</p>'+link('跟着完整示范做一次 '+icon('arrow'),'example','text-link')+'</section>'+
      '<section id="course-catalog" class="course-catalog"><div class="section-heading"><h2>16章，走通内容与经营。</h2><span>每章都有图解、练习与自测</span></div>'+
      D.groups.map(g=>'<div class="catalog-group"><div class="catalog-group-heading"><span>'+g.range+'</span><h3>'+g.title+'</h3></div><div class="catalog-lessons">'+D.chapters.filter(c=>c.group===g.id).map(c=>link('<span class="lesson-index">'+c.id+'</span><span><strong>'+e(c.shortTitle)+'</strong><small>'+e(c.principle)+'</small></span><span class="catalog-arrow">'+(state.completed.includes(c.id)?icon('check'):icon('arrow'))+'</span>','lesson-'+c.id,'catalog-lesson')).join('')+'</div></div>').join('')+'</section>'+
      '<section id="home-how" class="home-how"><h2>一章的学习方式</h2><ol><li>先用知识图理解关系，再读详细方法。</li><li>划出值得记住的原文，把判断写进练习笔记。</li><li>做一题自测，确认下一步行动，再标记完成。</li></ol><p class="note-text">进度、重点和笔记保存在当前浏览器；可在学习记录页导出备份。示范数字是教学模拟，来源作者成绩属于自述。</p>'+
      '<div class="resource-row">'+link('查看生财来源与高手地图 '+icon('arrow'),'sources')+link('下载12张研究表 '+icon('arrow'),'templates')+'</div></section>';
  }
  function lesson(c) {
    const previous=D.chapters[D.chapters.indexOf(c)-1],next=D.chapters[D.chapters.indexOf(c)+1];
    const answered=state.answers[c.id];
    const feedback=Number.isInteger(answered)?'<strong>'+(answered===c.quiz.correct?'判断正确。':'再看一下证据边界。')+'</strong> '+e(c.quiz.explanation):'';
    return pageHeader('学习手册 / '+groupName(c)+' / 第'+c.id+'章',e(c.shortTitle),e(c.principle),
      '<div class="lesson-meta"><span>'+icon('clock')+'预计阅读 '+c.minutes+'分钟</span><span>图解 · 方法 · 练习 · 自测</span></div>')+
      '<section id="key-points" class="key-points"><div class="section-heading"><h2>先记住这三点</h2>'+button(icon('star')+'收藏本章重点','save-key','text-button','data-id="'+c.id+'"')+'</div><ol>'+c.takeaways.map(t=>'<li>'+e(t)+'</li>').join('')+'</ol></section>'+
      '<section id="knowledge">'+K.render(c)+'</section>'+
      '<section id="method" class="method-section"><div class="section-heading"><h2>详细方法</h2><span class="highlight-hint">选中一段原文，可标为重点</span></div><article class="prose" id="lesson-body" data-chapter="'+c.id+'">'+c.body+'</article></section>'+
      '<section id="exercise" class="exercise-block"><div class="section-heading"><h2>做一个练习</h2><span>把理解变成动作</span></div><p class="exercise-task">'+e(c.exercise)+'</p>'+
      '<label for="lesson-notes">写下你的判断、证据与下一步</label><textarea id="lesson-notes" rows="5" data-notes="'+c.id+'" placeholder="我的判断是……&#10;证据来自……&#10;还缺少……&#10;下一步先做……">'+e(state.notes[c.id]||'')+'</textarea><small class="save-status" id="save-status">'+(persistent?'仅保存在当前浏览器；可从学习记录页导出。':'当前浏览器未允许保存，请导出笔记备份。')+'</small></section>'+
      '<section id="quiz" class="quiz-block"><span class="section-kicker">检查理解</span><h2>'+e(c.quiz.question)+'</h2><div class="quiz-options">'+c.quiz.options.map((o,i)=>button('<span>'+String.fromCharCode(65+i)+'</span>'+e(o),'answer','quiz-option '+(answered===i?'selected':''),'data-id="'+c.id+'" data-index="'+i+'" aria-pressed="'+(answered===i)+'"')).join('')+'</div><p class="quiz-feedback" role="status">'+feedback+'</p></section>'+
      '<section id="related-sources" class="related-sources"><h2>延伸学习</h2>'+c.sourceIds.map(id=>{const s=D.sources.find(x=>x.source_id===id);return s?'<a href="'+e(s.url)+'" target="_blank" rel="noopener noreferrer"><span>'+e(s.author)+'</span><strong>'+e(s.title)+'</strong><small>生财原文 ↗</small></a>':'';}).join('')+'<p class="note-text">方法学习线索。作者历史成绩不等于你的经营结果。</p></section>'+
      '<div class="lesson-completion">'+button(icon('check')+(state.completed.includes(c.id)?'已完成本章 · 点击取消':'我已学完，并写下下一步'),'complete','button primary','data-id="'+c.id+'" aria-pressed="'+state.completed.includes(c.id)+'"')+'</div>'+
      '<nav class="lesson-pagination" aria-label="相邻章节">'+(previous?link('← 第'+previous.id+'章 '+e(previous.shortTitle),'lesson-'+previous.id):link('← 入门导读','home'))+(next?link('第'+next.id+'章 '+e(next.shortTitle)+' →','lesson-'+next.id):link('去制定30天计划 →','plan'))+'</nav>';
  }
  function sources() {
    return pageHeader('学习工具 / 来源与高手地图','带着问题，学习真实经验。','阅读原文时，先决定自己要学的动作，再记录适用条件与验证。')+
      '<div class="source-summary"><span><strong>12</strong>篇精华帖</span><span><strong>9</strong>位作者</span><span><strong>4</strong>本航海手册</span><p>'+e(D.research.boundary)+'</p></div>'+
      '<section id="source-posts"><h2>精华帖与作者</h2><div class="source-list">'+D.sources.map(s=>'<article class="source-entry"><div class="source-byline"><span>'+e(s.author)+'</span><time>'+e(s.published)+'</time><span>'+e(s.source_id)+'</span></div><h3><a href="'+e(s.url)+'" target="_blank" rel="noopener noreferrer">'+e(s.title)+' ↗</a></h3><dl><div><dt>学什么</dt><dd>'+e(s.learn)+'</dd></div><div><dt>练习</dt><dd>'+e(s.exercise)+'</dd></div><div><dt>适用边界</dt><dd>'+e(s.boundary)+'</dd></div></dl></article>').join('')+'</div></section>'+
      '<section id="source-manuals" class="manual-library"><h2>航海手册学习顺序</h2>'+D.research.manuals.map((m,i)=>'<article><span class="manual-number">0'+(i+1)+'</span><div><h3>'+e(m.name)+'</h3><small>'+e(m.period)+'版本</small><p>'+m.chapters.map(e).join(' / ')+'</p></div></article>').join('')+
      '<p class="note-text">有效正文选读12节。进入'+ '<a href="https://scys.com/" target="_blank" rel="noopener noreferrer">生财有术</a>，按手册名与期次检索；阅读权限以自己的账户为准。</p></section>'+
      '<section id="source-use" class="prose"><h2>怎样读得更有用</h2><p>先写一个真实任务，只读与任务相关的段落。把条件、动作、结果和局限各摘一条，使用自己的材料复现，再回看原文。不要把成功者的阶段、资源与收入直接换成自己的预期。</p><p>来源核验日期：'+e(D.research.date)+'。本站呈现自己的研究方法与学习指引，原文请回到来源阅读。</p></section>';
  }
  function prompts() {
    return pageHeader('学习工具 / 分析提示词','让AI整理材料，让证据决定结论。','先提供真实取得的材料；缺失、未知与反证都保留下来。')+
      '<div class="prompt-library">'+D.prompts.map(p=>'<section id="prompt-'+p.id+'" class="prompt-entry"><div class="section-heading"><h2>'+e(p.title)+'</h2>'+button(icon('copy')+'复制','copy','text-button','data-prompt="'+p.id+'"')+'</div><pre><code>'+e(p.text)+'</code></pre></section>').join('')+'</div>';
  }
  function templates() {
    return pageHeader('学习工具 / 研究表','12张表，留下能够复查的证据。','表格只有字段，没有编造的数据。先填一次真实调查，再决定要补哪些信息。')+
      '<div class="template-list">'+D.templates.map((t,i)=>'<article class="template-entry"><span class="template-number">'+String(i+1).padStart(2,'0')+'</span><div><h2>'+e(t.name.replace(/^\d+-/,''))+'</h2><p>'+e(t.csv.trim().replace(/,/g,' · '))+'</p></div>'+button(icon('download')+'下载CSV','template','button secondary','data-index="'+i+'"')+'</article>').join('')+'</div>'+
      '<p class="note-text">CSV使用UTF-8编码，可导入Excel或多维表格。它们是空白研究模板；销量、阅读与咨询的统计口径需要自己注明。</p>';
  }
  function plan() {
    return pageHeader('学习工具 / 30天计划','30天，把方法练成自己的判断。','按实际进度走。完成一项，就保留对应证据与产物，再勾选完成。')+
      '<div class="plan-progress"><strong>'+state.days.length+' / 30</strong><span>项行动已完成</span><progress value="'+state.days.length+'" max="30" aria-label="30天行动完成进度"></progress></div>'+
      '<article class="prose" id="plan-body">'+D.plan.body+'</article>';
  }
  function example() {
    return pageHeader('学习工具 / 完整示范','从一条线索，到内容与产品。','跟着一个创作者任务，走过研究、实测、制作、经营与复盘。')+
      '<p class="example-notice">'+e(D.example.notice)+'</p><article class="prose" id="example-body">'+D.example.body+'</article>';
  }
  function notebook() {
    const notes=D.chapters.filter(c=>String(state.notes[c.id]||'').trim());
    return pageHeader('学习工具 / 我的记录','把学到的，变成你的下一步。','这些记录只属于当前浏览器。导出备份后，可以把自己的判断带走。',
      '<div class="hero-actions">'+button(icon('download')+'导出学习记录','export','button primary')+'</div>')+
      '<section id="record-progress" class="record-progress"><h2>学习进度</h2><p><strong>'+count()+'/16章</strong> · '+state.days.length+'/30项行动 · '+state.highlights.length+'条重点</p>'+
      '<div class="progress-grid">'+D.chapters.map(c=>link('<span>'+c.id+'</span><strong>'+e(c.shortTitle)+'</strong><small>'+(state.completed.includes(c.id)?'已完成':'待学习')+'</small>','lesson-'+c.id,'progress-chapter '+(state.completed.includes(c.id)?'done':''))).join('')+'</div></section>'+
      '<section id="record-highlights"><h2>我的重点</h2>'+(state.highlights.length?state.highlights.map(h=>'<article class="saved-highlight"><blockquote>'+e(h.quote)+'</blockquote><div>'+link('第'+e(h.chapter)+'章 · '+e(chapter(h.chapter)?.shortTitle||'学习重点'),'lesson-'+h.chapter)+button('删除','remove-highlight','text-button','data-hid="'+e(h.id)+'"')+'</div></article>').join(''):'<p class="empty-state">在章节正文中选中文字，点击「标为重点」；也可以收藏每章的三条重点。</p>')+'</section>'+
      '<section id="record-notes"><h2>我的练习笔记</h2>'+(notes.length?notes.map(c=>'<article class="saved-note"><h3>'+link('第'+c.id+'章 · '+e(c.shortTitle),'lesson-'+c.id)+'</h3><p>'+e(state.notes[c.id]).replace(/\n/g,'<br>')+'</p></article>').join(''):'<p class="empty-state">每章练习处可以写下判断、来源、未确定的问题和下一步。</p>')+'</section>';
  }
  function searchDialog() {
    return '<dialog id="search-dialog" class="search-dialog" aria-labelledby="search-title"><div class="search-dialog-head"><h2 id="search-title">查找章节或问题</h2>'+button(icon('close'),'close-search','icon-button','aria-label="关闭搜索"')+'</div><label class="search-field">'+icon('search')+'<input id="search-input" type="search" placeholder="试试：对标、标题、商单、Skill" aria-label="搜索学习内容" autocomplete="off"></label><div id="search-results" class="search-results" aria-live="polite"><p>输入一个任务或关键词，查找相关方法。</p></div><small>按Esc关闭 · /打开搜索</small></dialog>';
  }
  const texts = D.chapters.map(c=>{const div=document.createElement('div');div.innerHTML=c.body;return{id:c.id,title:c.shortTitle,text:div.textContent};});
  function search(query) {
    const q=query.trim().toLocaleLowerCase();
    const results = q ? texts.filter(t=>(t.title+' '+t.text).toLocaleLowerCase().includes(q)) : [];
    document.getElementById('search-results').innerHTML=!q?'<p>输入一个任务或关键词，查找相关方法。</p>':
      results.length?results.map(t=>{const i=t.text.toLocaleLowerCase().indexOf(q);const excerpt=i<0?t.text.slice(0,100):t.text.slice(Math.max(0,i-28),i+q.length+64);return link('<span>第'+t.id+'章</span><strong>'+e(t.title)+'</strong><p>'+e(excerpt)+'…</p>','lesson-'+t.id,'search-result');}).join(''):'<p>没有匹配的章节。可以换一个更具体的任务词。</p>';
  }
  function tocForHTML(html) {
    const el=document.createElement('div');el.innerHTML=html;
    return [...el.querySelectorAll('h2,h3')].filter(h=>h.id).map(h=>({id:h.id,title:h.textContent}));
  }
  function syncCurriculumScroll(previousScroll=0) {
    const nav=document.getElementById('curriculum'), active=nav?.querySelector('.nav-link.active');
    if(!nav||!active||!nav.clientHeight)return;
    nav.scrollTop=previousScroll;
    const navBox=nav.getBoundingClientRect(), itemBox=active.getBoundingClientRect();
    const progressBox=nav.querySelector('.sidebar-progress')?.getBoundingClientRect();
    const top=navBox.top+12;
    let bottom=Math.min(navBox.bottom,window.innerHeight)-12;
    if(progressBox&&progressBox.top>top&&progressBox.top<bottom)bottom=progressBox.top-12;
    if(bottom>top&&(itemBox.top<top||itemBox.bottom>bottom)) {
      nav.scrollTop+=itemBox.top-(top+(bottom-top-itemBox.height)/2);
    }
  }
  function render() {
    const previousSidebarScroll=document.getElementById('curriculum')?.scrollTop||0;
    route=getRoute();selection=null;
    document.body.dataset.page=route.page;
    let page,toc=[];
    if(route.page==='lesson') {
      const c=chapter(route.id);state.last=c.id;save();page=lesson(c);
      toc=[{id:'key-points',title:'三条重点'},{id:'knowledge',title:'知识图解'},...c.toc,{id:'exercise',title:'动手练习'},{id:'quiz',title:'检查理解'},{id:'related-sources',title:'延伸学习'}];
    } else if(route.page==='home') {page=home();toc=[{id:'home-path',title:'研究路线'},{id:'home-evidence',title:'选题证据'},{id:'home-first',title:'第一次练习'},{id:'course-catalog',title:'完整课程'},{id:'home-how',title:'怎样使用'}];}
    else if(route.page==='sources'){page=sources();toc=[{id:'source-posts',title:'精华帖与作者'},{id:'source-manuals',title:'航海手册'},{id:'source-use',title:'怎样阅读'}];}
    else if(route.page==='prompts'){page=prompts();toc=D.prompts.map(p=>({id:'prompt-'+p.id,title:p.title}));}
    else if(route.page==='templates'){page=templates();}
    else if(route.page==='plan'){page=plan();toc=tocForHTML(D.plan.body);}
    else if(route.page==='example'){page=example();toc=tocForHTML(D.example.body);}
    else{page=notebook();toc=[{id:'record-progress',title:'学习进度'},{id:'record-highlights',title:'我的重点'},{id:'record-notes',title:'练习笔记'}];}
    root.innerHTML=shell(page,toc);
    document.documentElement.style.setProperty('--reading-size',state.font+'px');
    document.title=(route.page==='lesson'?chapter(route.id).shortTitle:({home:'入门导读',sources:'来源学习地图',prompts:'分析提示词',templates:'研究表',plan:'30天执行计划',example:'完整示范',notebook:'学习记录'}[route.page]))+' · '+D.title;
    document.body.classList.remove('menu-open');
    K.attach(root);
    if(route.page==='lesson')restoreHighlights();
    if(route.page==='plan')attachPlan();
    document.querySelector('#search-input').addEventListener('input',evt=>search(evt.target.value));
    document.querySelector('#search-results').addEventListener('click',evt=>{
      const a=evt.target.closest('a');if(a){document.getElementById('search-dialog').close();if(a.hash===location.hash)render();}
    });
    window.scrollTo(0,0);
    syncCurriculumScroll(previousSidebarScroll);
  }
  function attachPlan() {
    document.querySelectorAll('#plan-body tbody tr').forEach(row=>{
      const td=row.querySelector('td'), n=Number(td?.textContent.trim());
      if(!Number.isInteger(n)||n<1||n>30)return;
      td.innerHTML='<label class="day-check"><input type="checkbox" data-day="'+n+'" '+(state.days.includes(n)?'checked':'')+' aria-label="完成第'+n+'天任务"><span>第'+n+'天</span></label>';
      row.classList.toggle('task-done',state.days.includes(n));
    });
  }
  async function copy(text) {
    try {
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
      else {
        const input=document.createElement('textarea');input.value=text;input.className='copy-buffer';input.setAttribute('aria-label','待复制文本');document.body.append(input);input.select();const ok=document.execCommand('copy');input.remove();if(!ok)throw new Error('copy failed');
      }
      toast('已复制，可粘贴到你的AI工具。');
    } catch {toast('当前浏览器不允许自动复制，请直接选中提示词复制。');}
  }
  function download(name,content,type) {
    const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');
    a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function restoreHighlights() {
    state.highlights.filter(h=>h.chapter===route.id&&h.block).forEach(h=>{
      const block=document.querySelector('[data-block="'+CSS.escape(h.block)+'"]');
      if(!block)return;
      let start=Number.isInteger(h.start)?h.start:block.textContent.indexOf(h.quote);
      if(block.textContent.slice(start,start+h.quote.length)!==h.quote)start=block.textContent.indexOf(h.quote);
      if(start<0)return;
      const walk=document.createTreeWalker(block,NodeFilter.SHOW_TEXT),nodes=[];let node,offset=0,a,b;
      while(node=walk.nextNode()){nodes.push({node,start:offset,end:offset+node.length});offset+=node.length;}
      a=nodes.find(n=>n.start<=start&&n.end>start);
      b=nodes.find(n=>n.start<start+h.quote.length&&n.end>=start+h.quote.length);
      if(!a||!b||a.node.parentElement.closest('mark')||b.node.parentElement.closest('mark'))return;
      const r=document.createRange();r.setStart(a.node,start-a.start);r.setEnd(b.node,start+h.quote.length-b.start);
      const mark=document.createElement('mark');mark.className='learner-highlight';mark.dataset.highlightId=h.id;
      try{mark.append(r.extractContents());r.insertNode(mark);}catch{}
    });
  }
  function captureSelection() {
    const control=document.getElementById('mark-selection');
    if(!control||route.page!=='lesson')return;
    const s=window.getSelection();
    if(!s||s.isCollapsed||!s.rangeCount){control.hidden=true;selection=null;return;}
    const r=s.getRangeAt(0),parent=n=>n.nodeType===Node.ELEMENT_NODE?n:n.parentElement;
    const a=parent(r.startContainer)?.closest('[data-block]'),b=parent(r.endContainer)?.closest('[data-block]');
    const quote=s.toString();
    if(!a||a!==b||!document.getElementById('lesson-body')?.contains(a)||quote.trim().length<2||quote.length>600||parent(r.startContainer)?.closest('mark')||parent(r.endContainer)?.closest('mark')){control.hidden=true;selection=null;return;}
    const before=document.createRange();before.selectNodeContents(a);before.setEnd(r.startContainer,r.startOffset);
    selection={chapter:route.id,block:a.dataset.block,quote,start:before.toString().length};
    control.hidden=false;
  }
  function addHighlight(h) {
    if(state.highlights.some(x=>x.chapter===h.chapter&&x.quote===h.quote&&x.block===h.block)){toast('这条重点已经收藏。');return;}
    state.highlights.push({...h,id:'h-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6)});save();toast('已保存到我的学习记录。');
  }
  root.addEventListener('click',evt=>{
    const el=evt.target.closest('[data-action]');if(!el)return;
    const action=el.dataset.action;
    if(action==='skip') {evt.preventDefault();document.getElementById('main').focus();document.getElementById('main').scrollIntoView();}
    else if(action==='menu') {
      const open=document.body.classList.toggle('menu-open');el.setAttribute('aria-expanded',String(open));
      if(open)syncCurriculumScroll(document.getElementById('curriculum').scrollTop);
    } else if(action==='close-menu') {
      document.body.classList.remove('menu-open');document.querySelector('[data-action="menu"]').setAttribute('aria-expanded','false');
    } else if(action==='anchor') {
      document.getElementById(el.dataset.target)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
      document.querySelectorAll('.toc-link').forEach(b=>b.classList.toggle('active',b===el));
    } else if(action==='search') {
      const dialog=document.getElementById('search-dialog');dialog.showModal();document.getElementById('search-input').focus();
    } else if(action==='close-search'){document.getElementById('search-dialog').close();}
    else if(action==='font'){state.font=state.font===17?18:state.font===18?20:17;save();document.documentElement.style.setProperty('--reading-size',state.font+'px');toast('正文字号：'+state.font+'px');}
    else if(action==='copy'){const p=D.prompts.find(p=>p.id===el.dataset.prompt);if(p)copy(p.text);}
    else if(action==='template'){const t=D.templates[Number(el.dataset.index)];if(t)download(t.file,'\uFEFF'+t.csv,'text/csv;charset=utf-8');}
    else if(action==='export'){download('AI博主学习记录-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({course:D.title,edition:D.edition,exportedAt:new Date().toISOString(),...state},null,2),'application/json;charset=utf-8');toast('已导出进度、重点与练习笔记。');}
    else if(action==='complete'){
      const id=el.dataset.id;state.completed=state.completed.includes(id)?state.completed.filter(x=>x!==id):[...state.completed,id];save();
      const y=window.scrollY;render();window.scrollTo(0,y);toast(state.completed.includes(id)?'本章已完成。记得做一次真实练习。':'已取消完成标记。');
    } else if(action==='answer') {
      const c=chapter(el.dataset.id),answer=Number(el.dataset.index);state.answers[c.id]=answer;save();
      document.querySelectorAll('.quiz-option').forEach(b=>{const selected=Number(b.dataset.index)===answer;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
      document.querySelector('.quiz-feedback').innerHTML='<strong>'+(answer===c.quiz.correct?'判断正确。':'再看一下证据边界。')+'</strong> '+e(c.quiz.explanation);
    } else if(action==='save-key'){
      const c=chapter(el.dataset.id);c.takeaways.forEach(quote=>addHighlight({chapter:c.id,quote,block:null}));toast('本章三条重点已收藏。');
    } else if(action==='highlight'&&selection){
      addHighlight(selection);window.getSelection().removeAllRanges();selection=null;
      document.getElementById('mark-selection').hidden=true;
      const y=window.scrollY;render();window.scrollTo(0,y);
    } else if(action==='remove-highlight'){
      state.highlights=state.highlights.filter(h=>h.id!==el.dataset.hid);save();render();toast('重点已删除。');
    }
  });
  root.addEventListener('input',evt=>{
    if(evt.target.matches('[data-notes]')){
      state.notes[evt.target.dataset.notes]=evt.target.value;save();
      document.getElementById('save-status').textContent=persistent?'已保存在当前浏览器。':'浏览器未允许保存，请导出备份。';
    }
  });
  root.addEventListener('change',evt=>{
    if(evt.target.matches('[data-day]')){
      const n=Number(evt.target.dataset.day);state.days=evt.target.checked?[...new Set([...state.days,n])]:state.days.filter(x=>x!==n);save();
      evt.target.closest('tr').classList.toggle('task-done',evt.target.checked);
      document.querySelector('.plan-progress strong').textContent=state.days.length+' / 30';
      document.querySelector('.plan-progress progress').value=state.days.length;
    }
  });
  document.addEventListener('selectionchange',captureSelection);
  root.addEventListener('pointerdown',evt=>{if(evt.target.closest('#mark-selection')&&selection)evt.preventDefault();});
  document.addEventListener('keydown',evt=>{
    const isField=evt.target.matches('input,textarea,select,[contenteditable="true"]');
    if(evt.key==='/'&&!isField){evt.preventDefault();document.getElementById('search-dialog').showModal();document.getElementById('search-input').focus();}
    if(evt.key==='Escape'){const dialog=document.getElementById('search-dialog');if(dialog?.open)dialog.close();document.body.classList.remove('menu-open');const b=document.querySelector('[data-action="menu"]');if(b)b.setAttribute('aria-expanded','false');}
  });
  window.addEventListener('hashchange',render);
  window.addEventListener('resize',()=>syncCurriculumScroll(document.getElementById('curriculum')?.scrollTop||0));
  render();
  window.LearningApp = {edition:D.edition, chapters:D.chapters.length};
})();
