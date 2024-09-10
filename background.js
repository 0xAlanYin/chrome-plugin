const API_KEY = 'AIzaSyD2Hp5M63aPysAQaGkGJF9l5Rlnbivr6vQ'; // 请确保这里使用的是您的实际API密钥
const MODEL_NAME = 'gemini-1.5-flash-latest';

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSummary") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: getPageContent,
        }, async (results) => {
          if (results && results[0]) {
            const content = results[0].result;
            try {
              const summary = await generateSummary(content);
              console.log("生成的摘要:", summary);
              sendResponse({summary: summary});
            } catch (error) {
              console.error("生成摘要时出错:", error);
              sendResponse({error: error.message});
            }
          } else {
            console.error("无法获取页面内容");
            sendResponse({error: "无法获取页面内容"});
          }
        });
      } else {
        console.error("没有活动的标签页");
        sendResponse({error: "没有活动的标签页"});
      }
    });
    return true;  // 表示我们会异步发送响应
  }
});

function getPageContent() {
  return document.body.innerText;
}

async function generateSummary(content) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `请用中文总结以下网页内容的要点:\n\n${content}`
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorJson = JSON.parse(errorText);
      if (errorJson.error && errorJson.error.message.includes("User location is not supported")) {
        throw new Error("抱歉，Gemini API 在您的地区暂不可用。请尝试使用 VPN 连接到支持的地区，或联系管理员寻求帮助。");
      } else {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`);
      }
    }

    const data = await response.json();
    console.log("API响应:", data);  // 添加这行来记录完整的API响应

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("API响应格式不正确");
    }
  } catch (error) {
    console.error("API请求出错:", error);
    throw error;
  }
}