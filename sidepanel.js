document.addEventListener('DOMContentLoaded', function() {
  const summaryElement = document.getElementById('summary');
  const fontSizeSlider = document.getElementById('fontSize');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const summarizeButton = document.getElementById('summarizeButton');

  // 字体大小滑块功能
  fontSizeSlider.addEventListener('input', function() {
    const size = this.value;
    summaryElement.style.fontSize = size + 'px';
    fontSizeValue.textContent = size;
  });

  // 总结按钮功能
  summarizeButton.addEventListener('click', function() {
    summaryElement.innerHTML = "正在生成概览...";
    chrome.runtime.sendMessage({action: "getSummary"}, function(response) {
      console.log("收到响应:", response);
      if (response.summary) {
        // 处理有序列表
        const formattedSummary = response.summary.replace(/(\d+\.\s)/g, '<br>$1');
        // 将换行符替换为<br>标签,并将内容设置为HTML
        summaryElement.innerHTML = formattedSummary.replace(/\n/g, '<br>');
      } else if (response.error) {
        summaryElement.textContent = `生成概览时出错: ${response.error}`;
      } else {
        summaryElement.textContent = '无法生成概览。请确保您在一个网页上。';
      }
    });
  });
});