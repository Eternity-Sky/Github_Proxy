// LeanCloud 初始化
AV.init({
  appId: "inEQ7b8BcXapBBKgw6Eb1XCl-MdYXbMMI",
  appKey: "IsMy7Ih2BImqoa9RzxzwG8gB",
  serverURLs: "https://ineq7b8b.api.lncldglobal.com"
});

// 更新访问计数
async function updateVisitCount() {
  try {
    const query = new AV.Query('VisitCount');
    query.equalTo('type', 'total');
    let visitCount = await query.first();
    
    if (!visitCount) {
      // 如果不存在则创建
      const VisitCount = AV.Object.extend('VisitCount');
      visitCount = new VisitCount();
      visitCount.set('type', 'total');
      visitCount.set('count', 0);
    }
    
    visitCount.increment('count');
    await visitCount.save();
    
    const count = visitCount.get('count');
    const countElement = document.getElementById('visit-count');
    if (countElement) {
      countElement.textContent = count.toLocaleString();
    }
  } catch (error) {
    console.error('更新计数失败:', error);
  }
}

// 获取当前计数
async function getVisitCount() {
  try {
    const query = new AV.Query('VisitCount');
    query.equalTo('type', 'total');
    let visitCount = await query.first();
    
    if (!visitCount) {
      // 如果不存在则创建
      const VisitCount = AV.Object.extend('VisitCount');
      visitCount = new VisitCount();
      visitCount.set('type', 'total');
      visitCount.set('count', 0);
      await visitCount.save();
    }
    
    const count = visitCount.get('count');
    const countElement = document.getElementById('visit-count');
    if (countElement) {
      countElement.textContent = count.toLocaleString();
    }
  } catch (error) {
    console.error('获取计数失败:', error);
  }
}

// 测试单个节点的延迟
async function testNode(node) {
  const startTime = Date.now();
  try {
    const response = await fetch(`https://${node}`, {
      mode: 'no-cors',
      timeout: 5000
    });
    const endTime = Date.now();
    return {
      node: node,
      latency: endTime - startTime,
      status: 'success'
    };
  } catch (error) {
    return {
      node: node,
      latency: 49999,
      status: 'failed'
    };
  }
}

// 测试所有节点
async function testAllNodes() {
  const progressSpan = document.getElementById('testProgress');
  progressSpan.textContent = '测试中...';
  
  try {
    const promises = proxyNodes.map(node => testNode(node));
    const results = await Promise.all(promises);
    const sortedResults = results.sort((a, b) => a.latency - b.latency);
    
    progressSpan.textContent = '测试完成';
    return sortedResults;
  } catch (error) {
    progressSpan.textContent = '测试失败';
    console.error('测试出错:', error);
    return [];
  }
}

// 初始化下拉框选项
function initializeProxySelect() {
  const select = document.getElementById('proxySelect');
  select.innerHTML = proxyNodes.map(node => `
    <option value="${node}">${node}</option>
  `).join('');
}

// 页面加载时初始化
window.onload = async () => {
  initializeProxySelect();
  getVisitCount();
};

// 点击下载时增加计数
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('download-btn')) {
    const input = document.querySelector('.input-group input');
    const select = document.getElementById('proxySelect');
    if (input.value && select.value) {
      const proxyUrl = `https://${select.value}/${input.value}`;
      window.open(proxyUrl);
      updateVisitCount();  // 增加访问计数
    }
  }
});
