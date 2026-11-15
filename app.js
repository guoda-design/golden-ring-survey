(() => {
  const app = document.getElementById("app");
  const resetButton = document.getElementById("reset-button");
  const questions = window.SURVEY.questions;
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const state = {
    started: false,
    terminated: false,
    demo: false,
    currentId: "S1",
    answers: {},
    other: {},
    infoOrder: ["dd", "gx"],
    choiceOrder: ["dd", "gx"]
  };

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const values = (id) => Array.isArray(state.answers[id]) ? state.answers[id] : [];
  const has = (id, value) => values(id).includes(value);
  const isAnswered = (id) => {
    const answer = state.answers[id];
    if (Array.isArray(answer)) return answer.length > 0;
    if (answer && typeof answer === "object") return Object.keys(answer).length > 0;
    return answer !== undefined && answer !== null && String(answer).trim() !== "";
  };

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  function classify() {
    if (!isAnswered("S2")) return "unknown";
    if (has("S2", "none")) return "potential";
    const needsDd = has("S2", "dd");
    const needsGx = has("S2", "px") || has("S2", "dx");
    if (needsDd && !isAnswered("S3_DD")) return "unknown";
    if (needsGx && !isAnswered("S3_GX")) return "unknown";
    const dd = needsDd && !has("S3_DD", "pass") && values("S3_DD").length > 0;
    const gx = needsGx && !has("S3_GX", "pass") && values("S3_GX").length > 0;
    if (dd && gx) return "both";
    if (dd) return "dd";
    if (gx) return "gx";
    return "potential";
  }

  function isActual() {
    return ["dd", "gx", "both"].includes(classify());
  }

  function recentCase() {
    const type = classify();
    if (type === "both") return state.answers.S4 || "dd";
    return type;
  }

  function isVisible(question) {
    const id = question.id;
    const type = classify();
    if (id === "S3_DD") return has("S2", "dd");
    if (id === "S3_GX") return has("S2", "px") || has("S2", "dx");
    if (id === "S4") return type === "both";
    if (id === "S5_TIME" || id === "S5_SEASON") return isActual();
    if (id === "C5") return type === "potential";
    if (id === "C6") return type === "potential" && ["dd", "gx", "both"].includes(state.answers.C5);
    if (question.section === "potential") return type === "potential";
    if (question.section === "actual") {
      if (!isActual()) return false;
      if (id === "V7A") return ["shorter", "longer"].includes(state.answers.V7);
      return true;
    }
    if (question.section === "both") return type === "both";
    return true;
  }

  function getFlow() {
    return questions.filter(isVisible);
  }

  function sampleLabel(type = classify()) {
    return {
      unknown: "待判定",
      potential: "潜在游客",
      dd: "丹东实际游客",
      gx: "广西实际游客",
      both: "双地实际游客"
    }[type];
  }

  function caseLabel(value = recentCase()) {
    return value === "dd" ? "丹东" : "广西凭祥—东兴";
  }

  function currentStage(question) {
    if (!question) return "screen";
    if (question.section === "screen") return "screen";
    if (["awareness", "info"].includes(question.section)) return "awareness";
    if (["choice", "potential", "actual"].includes(question.section)) return "main";
    if (question.section === "both") return "both";
    if (question.section === "demographic") return "demographic";
    return "end";
  }

  function pathPanel() {
    const flow = getFlow();
    const current = questionMap.get(state.currentId) || flow[0];
    const stage = currentStage(current);
    const order = ["screen", "awareness", "main", "both", "demographic", "end"];
    const currentIndex = order.indexOf(stage);
    const type = classify();
    const mainLabel = type === "potential" ? "潜在需求与选择" : "实际行程与消费";
    const items = [
      { id: "screen", title: "资格与经历筛选", note: sampleLabel() },
      { id: "awareness", title: "环线认知与介绍", note: "所有受访者共同作答" },
      { id: "main", title: mainLabel, note: type === "unknown" ? "等待筛选结果" : `当前：${sampleLabel()}` },
      { id: "both", title: "双地经历比较", note: type === "both" ? "简要评价另一地" : "当前路径无需作答", skipped: type !== "both" && currentIndex <= order.indexOf("both") },
      { id: "demographic", title: "基本信息", note: "所有受访者共同作答" },
      { id: "end", title: "作答摘要", note: "本地展示，不会上传" }
    ];
    const list = items.map((item) => {
      const itemIndex = order.indexOf(item.id);
      const status = item.skipped ? "skipped" : itemIndex < currentIndex ? "complete" : itemIndex === currentIndex ? "current" : "";
      return `<li class="path-item ${status}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.note)}</span></li>`;
    }).join("");
    const detail = type === "both"
      ? `详细评价：${caseLabel()}；之后简要比较另一地。`
      : type === "potential"
        ? "未识别到合格的实际游览经历，进入潜在需求模块。"
        : type === "unknown"
          ? "完成旅游经历筛选后自动确定分支。"
          : `进入${caseLabel(type)}实际游客模块，跳过潜在游客目的地选择题。`;
    return `<aside class="path-panel" aria-label="问卷分支路径">
      <div class="path-heading"><h2>调研路径图</h2><p>路径随真实作答自动更新</p></div>
      <ol class="path-list">${list}</ol>
      <div class="logic-box"><p><strong>当前样本：${escapeHtml(sampleLabel())}</strong></p><p>${escapeHtml(detail)}</p></div>
    </aside>`;
  }

  function progress(question) {
    if (question.type === "end") return 100;
    const flow = getFlow();
    const numbered = flow.filter((item) => !["info", "end"].includes(item.type));
    const index = numbered.findIndex((item) => item.id === question.id);
    if (question.type === "info") {
      const before = numbered.filter((item) => ["S1", "S2", "S3_DD", "S3_GX", "S4", "S5_TIME", "S5_SEASON", "C1", "C2", "C3"].includes(item.id)).length;
      return Math.round((before / numbered.length) * 100);
    }
    return Math.max(3, Math.round(((Math.max(index, 0)) / numbered.length) * 100));
  }

  function progressHtml(question) {
    const flow = getFlow();
    const numbered = flow.filter((item) => !["info", "end"].includes(item.type));
    const currentIndex = numbered.findIndex((item) => item.id === question.id);
    const label = question.type === "end" ? "已完成" : question.type === "info" ? "目的地介绍" : `第 ${currentIndex + 1} / ${numbered.length} 题`;
    return `<div class="progress-block">
      <div class="progress-meta"><strong>${escapeHtml(label)}</strong><span>${progress(question)}%</span></div>
      <div class="progress-track" role="progressbar" aria-valuenow="${progress(question)}" aria-valuemin="0" aria-valuemax="100"><div class="progress-value" style="width:${progress(question)}%"></div></div>
    </div>`;
  }

  function otherValue(questionId, optionValue) {
    return state.other[`${questionId}:${optionValue}`] || "";
  }

  function renderOptions(question) {
    let options = question.options;
    if (question.id === "C5") {
      const first = state.choiceOrder.map((value) => options.find((item) => item.value === value));
      options = [...first, ...options.filter((item) => !state.choiceOrder.includes(item.value))];
    }
    const selected = question.type === "single" ? [state.answers[question.id]] : values(question.id);
    return `<div class="options">${options.map((option, index) => {
      const checked = selected.includes(option.value);
      const inputType = question.type === "single" ? "radio" : "checkbox";
      const other = option.other && checked ? `<input class="field option-other-input" type="text" data-other="${question.id}" data-option="${escapeHtml(option.value)}" value="${escapeHtml(otherValue(question.id, option.value))}" placeholder="请填写具体内容" aria-label="其他内容">` : "";
      return `<label class="option ${checked ? "selected" : ""}" for="${question.id}-${index}">
        <input id="${question.id}-${index}" type="${inputType}" name="${question.id}" value="${escapeHtml(option.value)}" data-qid="${question.id}" ${checked ? "checked" : ""}>
        <span class="option-text">${escapeHtml(option.label)}${other}</span>
      </label>`;
    }).join("")}</div>`;
  }

  function productRows() {
    return recentCase() === "dd" ? [
      "鸭绿江断桥或抗美援朝相关参观", "虎山长城等历史文化体验", "河口、绿江村或浑江口沿边观光",
      "东港滨海或湿地观鸟", "海鲜、烧烤等地方餐饮", "草莓、蓝莓等采摘或特产购买",
      "农家院、民宿或乡村生活体验", "露营、房车或自驾驿站服务"
    ] : [
      "友谊关及边关历史体验", "东兴口岸或国门景区游览", "竹山村、G219 终点或界碑参观",
      "万尾金滩或其他滨海体验", "京族文化或地方民俗体验", "中越风味餐饮",
      "东盟商品或地方特产购买", "界河游等边境体验，不含实际出境", "民宿、露营或自驾驿站服务"
    ];
  }

  function renderMatrix(question) {
    const rows = question.id === "V11" ? productRows() : question.rows;
    const answers = state.answers[question.id] || {};
    return `<div class="matrix-wrap"><table class="matrix"><thead><tr><th scope="col">${question.id === "V11" ? "产品或体验" : "服务内容"}</th>${question.columns.map((column) => `<th scope="col">${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row, rowIndex) => `<tr><td>${escapeHtml(row)}</td>${question.columns.map((column) => `<td><input type="radio" name="${question.id}-${rowIndex}" aria-label="${escapeHtml(row)}：${escapeHtml(column.label)}" value="${escapeHtml(column.value)}" data-matrix="${question.id}" data-row="${rowIndex}" ${answers[rowIndex] === column.value ? "checked" : ""}></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function renderSpending(question) {
    const answers = state.answers[question.id] || {};
    return `<div class="spending-wrap"><table class="spending-table"><thead><tr><th scope="col">支出项目</th><th scope="col">金额（元）</th></tr></thead>
      <tbody>${question.rows.map((row, index) => `<tr><td>${escapeHtml(row)}</td><td><input class="field" type="number" min="0" step="1" inputmode="numeric" aria-label="${escapeHtml(row)}金额" data-spending="${question.id}" data-row="${index}" value="${escapeHtml(answers[index] ?? "")}" placeholder="可填 0"></td>`).join("")}</tbody></table></div>
      <p class="spending-note">支出按整个同行小组填写；无法回答也可以继续下一题。</p>`;
  }

  function renderNps(question) {
    const selected = state.answers[question.id];
    return `<div class="options">${Array.from({ length: 11 }, (_, score) => `<label class="option ${String(score) === String(selected) ? "selected" : ""}" for="V16-${score}"><input id="V16-${score}" type="radio" name="V16" value="${score}" data-qid="V16" ${String(score) === String(selected) ? "checked" : ""}><span class="option-text">${score} 分</span></label>`).join("")}</div>`;
  }

  function renderInput(question) {
    if (["single", "multi"].includes(question.type)) return renderOptions(question);
    if (question.type === "textarea") {
      return `<div class="field-grid"><label style="grid-column:1/-1"><span class="field-label">请填写</span><textarea class="field" data-text="${question.id}" placeholder="请输入你的回答">${escapeHtml(state.answers[question.id] || "")}</textarea></label></div>`;
    }
    if (question.type === "number") {
      return `<div class="field-grid"><label><span class="field-label">同行人数</span><span class="input-with-unit"><input class="field" type="number" min="${question.min}" max="${question.max}" data-text="${question.id}" value="${escapeHtml(state.answers[question.id] || "")}"><span>${escapeHtml(question.unit)}</span></span></label></div>`;
    }
    if (question.type === "residence") {
      const answer = state.answers[question.id] || {};
      return `<div class="field-grid"><label><span class="field-label">省／自治区／直辖市</span><input class="field" data-residence="province" value="${escapeHtml(answer.province || "")}" placeholder="例如：辽宁省"></label><label><span class="field-label">城市</span><input class="field" data-residence="city" value="${escapeHtml(answer.city || "")}" placeholder="例如：沈阳市"></label></div>`;
    }
    if (question.type === "matrix") return renderMatrix(question);
    if (question.type === "spending") return renderSpending(question);
    if (question.type === "nps") return renderNps(question);
    return `<div class="field-grid"><label><span class="field-label">请填写</span><input class="field" data-text="${question.id}" value="${escapeHtml(state.answers[question.id] || "")}"></label></div>`;
  }

  function renderInfo(question) {
    const general = question.sections[0];
    const cases = state.infoOrder.map((key) => question.sections[key === "dd" ? 1 : 2]);
    return `<div class="info-sheet">${[general, ...cases].map((section) => `<section class="info-section"><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.text)}</p></section>`).join("")}</div>`;
  }

  function formatAnswer(question) {
    const answer = state.answers[question.id];
    if (answer === undefined || answer === null || answer === "") return "未作答";
    if (question.type === "residence") return [answer.province, answer.city].filter(Boolean).join(" ") || "未作答";
    if (question.type === "spending") {
      return question.rows.map((row, index) => `${row}：${answer[index] === undefined || answer[index] === "" ? "未填" : `${answer[index]} 元`}`).join("；");
    }
    if (question.type === "matrix") {
      const rows = question.id === "V11" ? productRows() : question.rows;
      return rows.map((row, index) => {
        const column = question.columns.find((item) => item.value === answer[index]);
        return `${row}：${column ? column.label : "未作答"}`;
      }).join("；");
    }
    if (question.type === "nps") return `${answer} 分`;
    if (Array.isArray(answer)) {
      return answer.map((value) => {
        const option = question.options.find((item) => item.value === value);
        const extra = option?.other && otherValue(question.id, value) ? `（${otherValue(question.id, value)}）` : "";
        return `${option ? option.label : value}${extra}`;
      }).join("；") || "未作答";
    }
    if (question.options) {
      const option = question.options.find((item) => item.value === answer);
      const extra = option?.other && otherValue(question.id, answer) ? `（${otherValue(question.id, answer)}）` : "";
      return `${option ? option.label : answer}${extra}`;
    }
    return String(answer);
  }

  function renderEnd(terminated = false) {
    const flow = getFlow().filter((item) => !["info", "end"].includes(item.type));
    const answered = flow.filter((item) => isAnswered(item.id)).length;
    const type = classify();
    const attention = state.answers.D9 === "4" ? "已通过" : "未通过";
    return `<section class="question-card start-card">
      <p class="question-kicker">${terminated ? "筛选结束" : "作答完成"}</p>
      <h2>${terminated ? "感谢参与，本次问卷到此结束" : "问卷已完成"}</h2>
      <p class="start-intro">${terminated ? "本问卷面向年满 18 周岁的受访者。你的选择已记录在本次本地演示中。" : "以下摘要仅用于检查问卷分支和作答内容，不会上传或作为正式调查数据。"}</p>
      ${terminated ? "" : `<dl class="end-summary">
        <div class="summary-row"><dt>样本类型</dt><dd>${escapeHtml(sampleLabel())}</dd></div>
        ${type !== "potential" ? `<div class="summary-row"><dt>详细评价目的地</dt><dd>${escapeHtml(caseLabel())}</dd></div>` : ""}
        <div class="summary-row"><dt>已答题号</dt><dd>${answered} / ${flow.length}</dd></div>
        <div class="summary-row"><dt>注意力检测</dt><dd>${attention}</dd></div>
      </dl>
      <details class="end-summary"><summary>查看全部作答内容</summary><dl>${flow.map((question) => `<div class="summary-row"><dt>${escapeHtml(question.id)}</dt><dd><strong>${escapeHtml(question.title)}</strong><br>${escapeHtml(formatAnswer(question))}</dd></div>`).join("")}</dl></details>`}
      <div class="card-actions"><button class="button button-secondary" type="button" data-action="home">返回首页</button><button class="button button-primary" type="button" data-action="restart">重新作答</button></div>
    </section>`;
  }

  function renderQuestion(question) {
    if (question.type === "end") return renderEnd();
    const optional = !question.required && !["info"].includes(question.type) ? " <span class='optional-mark'>（选答）</span>" : "";
    const input = question.type === "info" ? renderInfo(question) : renderInput(question);
    const flow = getFlow();
    const index = flow.findIndex((item) => item.id === question.id);
    const nextLabel = index === flow.length - 2 ? "提交问卷" : question.type === "info" ? "继续作答" : "下一题";
    return `<section class="question-card" data-question="${question.id}">
      <p class="question-kicker">${escapeHtml(question.id)} · ${escapeHtml(question.section === "screen" ? "筛选" : question.section === "awareness" ? "共同问题" : question.section === "potential" || question.section === "choice" ? "潜在游客" : question.section === "actual" ? `${caseLabel()}实际游客` : question.section === "both" ? "双地比较" : question.section === "demographic" ? "基本信息" : "问卷说明")}</p>
      <h2 class="question-title">${escapeHtml(question.title)}${question.required ? "<span class='required-mark'> *</span>" : optional}</h2>
      ${question.help ? `<p class="question-help">${escapeHtml(question.help)}</p>` : ""}
      ${input}
      <p class="error-message" id="error-message" role="alert"></p>
      <div class="card-actions"><button class="button button-secondary" type="button" data-action="back" ${index <= 0 ? "disabled" : ""}>上一题</button><button class="button button-primary" type="button" data-action="next">${nextLabel}</button></div>
    </section>`;
  }

  function renderStart() {
    app.innerHTML = `<section class="question-card start-card">
      <p class="question-kicker">旅游需求 · 停留消费 · 产品体验</p>
      <h2>${escapeHtml(window.SURVEY.title)}</h2>
      <p class="start-intro">这是一份带自动筛选和分支的研究问卷。系统会根据近 24 个月的真实旅游经历，将受访者分配到潜在游客、丹东游客、广西游客或双地游客路径。</p>
      <div class="start-facts">
        <div class="start-fact"><strong>4 条</strong><span>可独立查看的作答路径</span></div>
        <div class="start-fact"><strong>约 30—41 题</strong><span>实际题量随分支变化</span></div>
        <div class="start-fact"><strong>本地运行</strong><span>不上传、不保存正式样本</span></div>
      </div>
      <div class="start-actions"><button class="button button-primary" type="button" data-action="start">开始作答</button></div>
      <div class="demo-panel"><h3>直接查看分支</h3><p>演示模式会填入明确标注的示例答案，并跳到对应路径的关键位置。</p><div class="demo-grid">
        <button class="demo-choice" type="button" data-demo="potential"><strong>潜在游客</strong><span>目的地选择与出游需求</span></button>
        <button class="demo-choice" type="button" data-demo="dd"><strong>丹东游客</strong><span>实际行程、消费与丹东产品</span></button>
        <button class="demo-choice" type="button" data-demo="gx"><strong>广西游客</strong><span>实际行程、消费与广西产品</span></button>
        <button class="demo-choice" type="button" data-demo="both"><strong>双地游客</strong><span>最近行程详评与另一地比较</span></button>
      </div></div>
    </section>`;
  }

  function render() {
    if (!state.started) {
      renderStart();
      return;
    }
    if (state.terminated) {
      app.innerHTML = renderEnd(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const flow = getFlow();
    if (!flow.some((item) => item.id === state.currentId)) state.currentId = flow[0].id;
    const current = questionMap.get(state.currentId);
    const path = pathPanel();
    app.innerHTML = `${state.demo ? '<div class="demo-banner">演示模式：当前答案为示例内容，仅用于查看分支，不会提交。</div>' : ""}
      <details class="mobile-path"><summary>查看当前分支路径</summary>${path}</details>
      <div class="survey-layout">${path}<div class="question-column">${progressHtml(current)}${current.type === "end" ? renderEnd() : renderQuestion(current)}</div></div>`;
  }

  function setError(message) {
    const element = document.getElementById("error-message");
    if (element) element.textContent = message;
  }

  function validate(question) {
    if (!question.required) return true;
    const answer = state.answers[question.id];
    if (["single", "multi"].includes(question.type)) {
      const selected = question.type === "single" ? answer : values(question.id);
      if (selected === undefined || selected === null || selected.length === 0) {
        setError("请选择一个选项后继续。");
        return false;
      }
      const selectedValues = question.type === "single" ? [answer] : selected;
      for (const value of selectedValues) {
        const option = question.options.find((item) => item.value === value);
        if (option?.other && !otherValue(question.id, value).trim()) {
          setError("请填写“其他”选项的具体内容。");
          return false;
        }
      }
      return true;
    }
    if (question.type === "matrix") {
      const rows = question.id === "V11" ? productRows() : question.rows;
      if (rows.some((_, index) => !answer || !answer[index])) {
        setError("请完成矩阵中的每一行，未接触的项目可选择“不了解”。");
        return false;
      }
      return true;
    }
    if (question.type === "residence") {
      if (!answer?.province?.trim() || !answer?.city?.trim()) {
        setError("请填写常住省市。");
        return false;
      }
      return true;
    }
    if (question.type === "number") {
      const number = Number(answer);
      if (!Number.isFinite(number) || number < question.min || number > question.max) {
        setError(`请输入 ${question.min}—${question.max} 之间的数字。`);
        return false;
      }
      return true;
    }
    if (answer === undefined || answer === null || !String(answer).trim()) {
      setError("请填写本题后继续。");
      return false;
    }
    return true;
  }

  function startSurvey() {
    state.started = true;
    state.terminated = false;
    state.demo = false;
    state.currentId = "S1";
    state.answers = {};
    state.other = {};
    state.infoOrder = shuffle(["dd", "gx"]);
    state.choiceOrder = shuffle(["dd", "gx"]);
    render();
  }

  function defaultAnswer(question) {
    if (question.id === "D9") return "4";
    if (question.id === "V7") return "same";
    if (question.id === "C5") return "dd";
    if (question.type === "single") return question.options[0].value;
    if (question.type === "multi") return [question.options.find((item) => !question.exclusive?.includes(item.value))?.value || question.options[0].value];
    if (question.type === "number") return "2";
    if (question.type === "residence") return { province: "北京市", city: "北京市" };
    if (question.type === "matrix") {
      const rows = question.id === "V11" ? productRows() : question.rows;
      return Object.fromEntries(rows.map((_, index) => [index, question.id === "V11" ? "paid" : "4"]));
    }
    if (question.type === "spending") return Object.fromEntries(question.rows.map((_, index) => [index, index === question.rows.length - 1 ? "2000" : ""]));
    if (question.type === "nps") return "8";
    if (question.type === "textarea") return question.required ? "演示填写的行程体验。" : "";
    if (question.type === "text") return "演示填写";
    return undefined;
  }

  function runDemo(type) {
    state.answers = { S1: "yes" };
    state.other = {};
    if (type === "potential") state.answers.S2 = ["none"];
    if (type === "dd") {
      state.answers.S2 = ["dd"];
      state.answers.S3_DD = ["history"];
    }
    if (type === "gx") {
      state.answers.S2 = ["dx"];
      state.answers.S3_GX = ["youyi"];
    }
    if (type === "both") {
      state.answers.S2 = ["dd", "dx"];
      state.answers.S3_DD = ["history"];
      state.answers.S3_GX = ["youyi"];
      state.answers.S4 = "dd";
    }
    for (let pass = 0; pass < 4; pass += 1) {
      getFlow().forEach((question) => {
        if (["info", "end"].includes(question.type)) return;
        if (!isAnswered(question.id) || (question.type === "textarea" && question.required && !state.answers[question.id])) {
          const answer = defaultAnswer(question);
          if (answer !== undefined && (answer !== "" || !question.required)) state.answers[question.id] = answer;
        }
      });
    }
    state.started = true;
    state.terminated = false;
    state.demo = true;
    state.infoOrder = ["dd", "gx"];
    state.choiceOrder = ["dd", "gx"];
    state.currentId = type === "potential" ? "C5" : "V1";
    render();
  }

  function goNext() {
    const question = questionMap.get(state.currentId);
    if (!validate(question)) return;
    if (question.id === "S1" && state.answers.S1 === "no") {
      state.terminated = true;
      render();
      return;
    }
    const flow = getFlow();
    const index = flow.findIndex((item) => item.id === state.currentId);
    const next = flow[index + 1];
    if (next) {
      state.currentId = next.id;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    const flow = getFlow();
    const index = flow.findIndex((item) => item.id === state.currentId);
    if (index > 0) {
      state.currentId = flow[index - 1].id;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  app.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    const demo = event.target.closest("[data-demo]");
    if (demo) runDemo(demo.dataset.demo);
    if (!action) return;
    if (action.dataset.action === "start" || action.dataset.action === "restart") startSurvey();
    if (action.dataset.action === "next") goNext();
    if (action.dataset.action === "back") goBack();
    if (action.dataset.action === "home") {
      state.started = false;
      state.terminated = false;
      render();
    }
  });

  app.addEventListener("change", (event) => {
    const input = event.target;
    if (input.dataset.qid) {
      const question = questionMap.get(input.dataset.qid);
      if (question.type === "single" || question.type === "nps") {
        state.answers[question.id] = input.value;
      } else {
        let selected = values(question.id);
        if (input.checked) {
          if (question.max && selected.length >= question.max) {
            input.checked = false;
            setError(`本题最多选择 ${question.max} 项。`);
            return;
          }
          if (question.exclusive?.includes(input.value)) selected = [input.value];
          else selected = [...selected.filter((value) => !question.exclusive?.includes(value)), input.value];
        } else selected = selected.filter((value) => value !== input.value);
        state.answers[question.id] = selected;
      }
      setError("");
      render();
    }
    if (input.dataset.matrix) {
      const id = input.dataset.matrix;
      const current = state.answers[id] || {};
      current[input.dataset.row] = input.value;
      state.answers[id] = current;
      setError("");
    }
  });

  app.addEventListener("input", (event) => {
    const input = event.target;
    if (input.dataset.text) {
      state.answers[input.dataset.text] = input.value;
      setError("");
    }
    if (input.dataset.other) {
      state.other[`${input.dataset.other}:${input.dataset.option}`] = input.value;
      setError("");
    }
    if (input.dataset.residence) {
      const current = state.answers.D3 || {};
      current[input.dataset.residence] = input.value;
      state.answers.D3 = current;
      setError("");
    }
    if (input.dataset.spending) {
      const id = input.dataset.spending;
      const current = state.answers[id] || {};
      current[input.dataset.row] = input.value;
      state.answers[id] = current;
    }
  });

  resetButton.addEventListener("click", () => {
    state.started = false;
    state.terminated = false;
    state.demo = false;
    state.answers = {};
    state.other = {};
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  render();
})();
