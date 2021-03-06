/* eslint-disable */
// import storage from '../util/storage'

require('./header')

// var content = chrome.extension.getURL('js/content.js')
// var script = document.createElement('script')
// script.setAttribute('type', 'text/javascript')
// script.setAttribute('src', content)
// document.body.appendChild(script)

let body = document.body;
let state = 0;
let x = 0;
let y = 0;
let g_selectedText = ''

function chooseEngineer(text) {
	console.log('搜索', text)
	chrome.extension.sendMessage({ resource: "content" }, function (response) {
		openSearch(response.whichone, text);
	});
	//这里由于sendMessage是异步的原因，如果直接return会造成未来得及返回正确的值,所以将执行函数提升到onmessage中。
}

function createDiv(text, left, top) {
    console.log('createDev')
	var div = document.createElement('div')
	let menus = [
		{
			id: 'a_copy',
			label: '复制',
			click() {
				copyToBorad(text)
			}
		},
		{
			id: 'a_search',
			label: '搜索',
			click() {
				chooseEngineer(text);
			}
		},
		{
			id: 'a_save',
			label: '保存',
			click() {
				saveText(text)
			}
		},
		{
			id: 'a_edit',
			label: '编辑',
			click() {
				chrome.runtime.sendMessage({
					type: 'type_editText',
					data: text
				}, res => {
				})
			}
		},
		{
			id: 'a_share',
			label: '分享',
			click() {
				// saveText(text)
			}
		},
	]
	let match = text.match(/(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/)
	if (match) {
		menus.push({
			id: 'a_url',
			label: '打开链接',
			click() {
				let match = text.match(/(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/)
				window.open(match[0], '_blank')
			}
		},)
	}
	let items = []
	for (let menu of menus) {
		items.push(`<span class="yext-selection-item">
			<a class="yext-selection-link" id="${menu.id}" href="javascript:;">${menu.label}</a>
		</span>`)
	}
    div.innerHTML = `
        <div class="yext-selection-list" id="selectionHelper">
            ${items.join('\n')}
        </div>
    `
    div.style.cssText = `
    left: ${left}px;
    top: ${top}px;
    position: fixed;
     z-index: 999;
      background-color: rgb(255, 255, 255);

    `
	document.body.appendChild(div)
	document.querySelector('#selectionHelper').addEventListener('mousedown', e => {
        console.log('selection click')
        e.stopPropagation()
        // if (e.button === 1) {
        // }
    }, true)
	for (let menu of menus) {
		document.querySelector('#' + menu.id).addEventListener('click', e => {
			menu.click && menu.click()
			closeIcons()
		}, true)
	}
}

function copyToBorad(text) {
	var textarea = document.createElement('textarea')
	document.body.appendChild(textarea)
	textarea.value = text
	textarea.select()
	document.execCommand('copy')
	textarea.remove()
    console.log('复制成功', text)
    showToast('已复制')
}

function showToast(text) {
    let id = '' + new Date().getTime()
    var div = document.createElement('div');
    div.innerHTML = `
        <div class="yext-toast" id="yext-toast-${id}">
            ${text}
        </div>
    `
    document.body.appendChild(div)
    setTimeout(() => {
        div.remove()
    }, 1000)
}

function saveText(text) {
    chrome.runtime.sendMessage({
        type: 'type_saveNote',
        data: {
			content: text,
			host: location.host
		}
    },
    res => {
        showToast('保存成功')
    })
}

function openSearch(search_engineer, text) {
	console.log('clik', openSearch)
	switch (search_engineer) {
		case '0':
			window.open("http://www.baidu.com/baidu?word=" + text, "_blank");
			break;
		case '1':
			window.open("http://cn.bing.com/search?q=" + text, "_blank");
			break;
		case '2':
			window.open("https://www.google.com.hk/?q=hello#safe=strict&q=" + text, "_blank");
			break;
	};
}

body.addEventListener('mouseup', function (e) {
    console.log('mouseup', state)
    if (state == 1) {
        return
    }
	var selected = window.getSelection()
	var selectedText = selected.toString()
	selectedText = selectedText.replace(/^\s+/, '').replace(/\s+$/, '')
	console.log('选择的文本：', selectedText)
	if (selectedText) {
		var eve = e || window.event
		x = eve.clientX
		y = eve.clientY
		x += document.body.scrollLeft
		y += document.body.scrollTop
		g_selectedText = selectedText
		createDiv(selectedText, x, y)
		state = 1;

		// select to copy
		// copyToBorad(selectedText)
	}
}, false);

function closeIcons() {
	var div = document.getElementById("selectionHelper");
	if (div) {
		// div.style.display = "none";
        state = 0;
        console.log('close')
		div.remove()
	}
}
document.body.addEventListener("mousedown", function (e) {
	console.log('mousedown')
	if (state == 1) {
		var xx = e.clientX;
		var yy = e.clientY;
		xx += document.body.scrollLeft;
		yy += document.body.scrollTop;
		if (xx <= x + 38 && yy <= y + 26) {

		} else {
			// var div = document.getElementById("selectionHelper"); // TODO
			// if (!div) {
			// 	return
			// }
			// div.style.display = "none";
			// state = 0;
			// div.remove()
        }
        
        var div = document.getElementById("selectionHelper"); // TODO
    if (!div) {
        return
    }
    div.style.display = "none";
    state = 0;
    div.remove()
            

	}
	closeIcons()
}, false)


document.body.addEventListener("contextmenu", function (e) {
	console.log('菜单')
	let $context = document.querySelector('#yext-context')
	let $contextMenu = document.querySelector('#yext-context-menu')
	let actions = [
		{
			id: '1',
			label: '关闭',
			click() {
				chrome.runtime.sendMessage({
					type: 'type_closeWindow',
				})
			}
		},
		{
			id: '2',
			label: '撤销关闭',
			click() {
				chrome.runtime.sendMessage({
					type: 'type_openCloseTab',
				})
			}
		},
		{
			id: '3',
			label: '新标签页',
			click() {
				chrome.runtime.sendMessage({
					type: 'type_newTab',
				})
			}
		},
		{
			id: '4',
			label: '历史记录',
			click() {
				chrome.runtime.sendMessage({
					type: 'type_history',
				})
			}
		},
		{
			id: '5',
			label: '拓展程序',
			click() {
				chrome.runtime.sendMessage({
					type: 'type_openUrl',
					data: 'chrome://extensions/'
				})
			}
		},
		{
			id: '6',
			label: '稍后阅读',
			click() {
				chrome.runtime.sendMessage({
					type: 'type_readLater',
				})
			}
		},
		// {
		// 	id: '7',
		// 	label: '编辑',
		// 	click() {
		// 		chrome.runtime.sendMessage({
		// 			type: 'type_readLater',
		// 		})
		// 	}
		// }
	]
	let actionHtml = []
	for (let item of actions) {
		actionHtml.push(
			`<div id="yext-context-menu-action-${item.id}" class="yext-context-menu-btn">
				${item.label}
			</div>`)
	}
	actionHtml = actionHtml.join('\n')
	

	if (!$context) {
		$context = document.createElement('div')
		$context.innerHTML = `
			<div id="yext-context">
				<div class="yext-big-action"></div>
				<div class="yext-context-menu" id="yext-context-menu">
					${actionHtml}
				</div>
			</div>
			`
		document.body.appendChild($context)
		$context = document.querySelector('#yext-context')
		$contextMenu = document.querySelector('#yext-context-menu')

		for (let item of actions) {
			document.querySelector(`#yext-context-menu-action-${item.id}`).addEventListener('click', () => {
				item.click && item.click()
			})
		}

		let hideElem
		document.body.addEventListener('click', hideElem = () => {
			$context.remove()
			document.body.removeEventListener('click', hideElem)
		})
		
	}
	let top = e.clientY - 24 - 8
	let left = e.clientX
	// left += document.body.scrollLeft
	// top += document.body.scrollTop
	$contextMenu.style.top = top + 'px'
	$contextMenu.style.left = left + 'px'
}, false)


// chrome.extension.onMessage.addListener(function(request,sender,sendResponse){
// 	console.log('youxiaoxi')
// 	if(request.resource == "content"){
// 		whichoneSearch = getItem();
// 		sendResponse({whichone:whichoneSearch});
// 	}else if(request.resource == "popup"){
// 		sendResponse({whichone:request.selected});
// 		localStorage.setItem("index",request.selected);
// 	}
// })

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log('onMessage')
	// if(request.editable) {
	//     var focused = document.activeElement;
	//     if(request.doAppend) {
	//         focused.value+=request.info;
	//     } else {
	//         focused.value = request.info;            
	//     }
	// }
	// var focused = document.activeElement
    if (request.type === 'type_fill_text') {
		console.log('收到type_fill_text', request.data)
        // showPasswordList(request.data)
        document.activeElement.value = request.data
        // document.activeElement.style.display = 'none'
	}
})

// background color
// let bgColor = storage.get('globalBgColor', '')
// console.log('bgcolor', bgColor)
// if (bgColor) {
// 	document.body.style.backgroundColor = bgColor
// }
// document.body.style.backgroundColor = '#000'
chrome.storage.local.get('globalBgColor', (res, b) => {
	document.body.style.backgroundColor = res.globalBgColor
})

let styleText = ''
if (location.host === 'www.baidu.com') {
	styleText = `
// body {
// 	background-color: #09c;
// }
`
}

if (location.host === 'www.zhihu.com') {
	styleText = `
	.GlobalSideBar,
	.Question-sideColumn,
	.CornerAnimayedFlex {
		display: none;
	}
`
}

function setPageStyle(id, styleText) {
	let styleElem = document.createElement('style')
	styleElem.setAttribute('id', 'ysStyle-' + id)
	styleElem.setAttribute('class', 'yunser-style')
	styleElem.setAttribute('type', 'text/css')
	styleElem.appendChild(document.createTextNode(styleText))
	var head = document.getElementsByTagName("head")[0];

	head.appendChild(styleElem);
}

// function loadIcon() {
// 	let styleElem = document.createElement('link')
// 	styleElem.setAttribute('rel', 'stylesheet')
// 	styleElem.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons')
// 	var head = document.getElementsByTagName("head")[0];
// 	head.appendChild(styleElem);
// }
// loadIcon()

// setPageStyle('1', styleText)

// document.documentElement.appendChild(styleElem)

// console.log('当前页面', location)


// function addStyleElement(styleElement) {
// 	if (!doc.documentElement || doc.getElementById(styleElement.id)) {
// 		return;
// 	}
// 	document.documentElement.appendChild(styleElem)
// 	  .disabled = g_disableAll;
// 	getDynamicIFrames(doc).forEach(function(iframe) {
// 		if (iframeIsLoadingSrcDoc(iframe)) {
// 			addStyleToIFrameSrcDoc(iframe, styleElement);
// 		} else {
// 			addStyleElement(styleElement, iframe.contentDocument);
// 		}
// 	});
// }

// addStyleElement(styleElement, document);

// 监听长连接
chrome.runtime.onConnect.addListener(function (port) {
	console.log(port);
	if (port.name == 'test-connect') {
		port.onMessage.addListener(function (msg) {
			console.log('收到长连接消息：', msg);
			if (msg.type == 'setStyle') {
				console.log('设置样式', msg.style)
				setPageStyle(msg.style.id, msg.style.style)
				// port.postMessage({answer: '我是你爸！'});
			}
			if (msg.type == 'removeStyle') {
				let styleElem = document.getElementById('ysStyle-' + msg.style.id)
				if (!styleElem) {
					console.log('not found')
				}
				styleElem.parentNode.removeChild(styleElem)
			}
			if (msg.type == 'openReadMode') {
				openReadMode()
			}
			if (msg.type == 'setToClipboard') {
				copyToBorad(msg.data)
			}
			if (msg.type == 'showToast') {
				showToast(msg.data)
			}

		});
	}
});

chrome.runtime.sendMessage({
	type: 'getStyle',
	url: location.host
}, res => {
	if (!res) {
		return
	}
	for (let item of res) {
		setPageStyle(item.id, item.style)
	}
})

// 阅读模式
let simpleplugins = [
	{
		id: '998-1',
		host: 'www.jianshu.com',
		match: 'www.jianshu.com/p/',
		articleSelector: '.show-content-free',
		style: `
			.navbar,
			.note {
				display: none !important;
			}	
		`
	},
	{
		id: '998-2',
		host: 'www.cnblogs.com',
		match: 'www.cnblogs.com/[\\d\\D]+?/p/[\\d\\D]+?.html',
		articleSelector: '#cnblogs_post_body',
		style: `
			#home {
				display: none;
			}	
		`
	},
	{
		id: '998-3',
		host: 'sspai.com',
		match: 'sspai.com',
		articleSelector: '.wangEditor-txt',
		style: `
		#app {
			display: none;
		}		
		`
	},
	{
		id: '998-3',
		host: 'blog.csdn.net',
		match: 'blog.csdn.net',
		articleSelector: '#article_content',
		style: `
		.pulllog-box,
	#mainBox {
		display: none !important;
	}		
		`
	},
	{
		id: '998-4',
		host: 'segmentfault.com',
		match: 'segmentfault.com',
		articleSelector: '.article__content',
		style: `
		.blog-post2 {
		display: none !important;
	}		
		`
	}
]

function openReadMode() {
	let found = false
	for (let plugin of simpleplugins) {
		if (plugin.host === location.host) {
			loadSimplePlugin(plugin)
			found = true
			break
		}
	}
	if (!found) {
		let elem = document.querySelector('#article')
		if (elem) {
			loadSimplePlugin({
				style: '',
				articleSelector: '#article',
			})
			return
		}
		elem = document.querySelector('.article')
		if (elem) {
			loadSimplePlugin({
				style: '',
				articleSelector: '.article',
			})
			return
		}
		elem = document.querySelector('article')
		if (elem) {
			loadSimplePlugin({
				style: '',
				articleSelector: 'article',
			})
			return
		}
	}
}

function loadSimplePlugin(plugin) {
	console.log('loadSimplePlugin(', plugin)
	// if (!new RegExp(plugin.match).test(location.href)) {
	// 	return
	// }
	setPageStyle('ys-simple-style', `
	body {
		background-color: '#f00'
		overflow: hidden;
	}
	${plugin.style}
	.yunser-reader-mode {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000000000;
		background-color: #f9f9f9;
		overflow-x: hidden;
		overflow-x: auto;
	}
	.yrm-container {
		width: 100%;
		max-width: 640px;
		margin: 0 auto;
	}
	.yrm-article {
		padding: 32px;
	}
	.yrm-article blockquote {
		border-left: 4px solid #eee;
	}
	.yrm-article h1 {
        margin-top: 20px;
        margin-bottom: 15px;
        padding-bottom: 5px;
        font-size: 30px;
    }
    .yrm-article h2 {
        margin-top: 20px;
        margin-bottom: 15px;
        padding-bottom: 5px;
        font-size: 25px;
    }
    .yrm-article h3 {
        font-size: 22px;
        margin-top: 15px;
        margin-bottom: 15px;
    }
    .yrm-article h4 {
        font-size: 20px;
    }
    .yrm-article h5,
    .yrm-article h6 {
        font-size: 20px;
    }
    .yrm-article p {
        line-height: 1.7;
        margin-bottom: 15px;
    }
    .yrm-article img {
        margin-bottom: 16px;
        max-width: 100%;
    }
    .yrm-article ul {
        list-style: disc;
    }
    .yrm-article ol {
        list-style: decimal;
    }
    .yrm-article li {
        line-height: 1.6;
        margin-bottom: 8px;
        list-style-type: inherit;
    }
    .yrm-article ul,
    .yrm-article ol {
        padding-left: 16px;
        margin-bottom: 16px;
        ul,
        ol {
            margin-top: 8px;
            padding-left: 40px;
        }
    }
    .yrm-article ul ul,
    .yrm-article ol ul {
        list-style-type: circle;
    }
    .yrm-article ol ol ul,
    .yrm-article ol ul ul,
    .yrm-article ul ol ul,
    .yrm-article ul ul ul {
        list-style-type: square;
    }
    .yrm-article table {
        max-width: 100%;
        margin-bottom: 16px;
        th,
        td {
            padding: 8px 16px;
            line-height: 1.42857143;
            vertical-align: top;
            border: 1px solid #ddd;
        }
    }
    .yrm-article pre code {
        padding: 16px;
    }
	.yrm-close {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 1001;
		color: #f00;
		cursor: pointer;
	}
	`)
	let $root = document.createElement('div')
	$root.className = 'yunser-reader-mode'
	$root.innerHTML = `
	<div class="yrm-close" id="close">关闭</div>
	<div class="yrm-container" id="yrm-container">
		<article id="yrm-article" class="yrm-article"></article>
	</div>
	`
	// styleElem.setAttribute('id', 'ysStyle-' + id)
	// styleElem.setAttribute('class', 'yunser-style')
	// styleElem.setAttribute('type', 'text/css')
	// styleElem.appendChild(document.createTextNode(styleText))
	let body = document.getElementsByTagName('body')[0];
	body.appendChild($root)
	let article = document.querySelector(plugin.articleSelector)
	console.log('article', article.innerHTML)

	let $article = document.getElementById('yrm-article')
	console.log('elem', $article)
	$article.innerHTML = article.innerHTML
	let $close = document.getElementById('close')
	function $$(selector) {
		return document.querySelector(selector)
	}
	$close.addEventListener('click', () => {
		let $style = document.getElementById('ysStyle-ys-simple-style')
		$style.parentNode.removeChild($style)
		$root.parentNode.removeChild($root)
	})
}

function dealPageAction() {
	let $root = document.createElement('div')
	$root.innerHTML = `
		<div class="yunser-page-actions" id="yunser-page-actions">

		</div>
	`
	let body = document.body
	body.appendChild($root)
}

dealPageAction()

function dealPlugins() {
	let $root = document.createElement('div')
	$root.innerHTML = `
		<div>
			<div class="yext-plugin-box-bar">
				<div class="yext-plugin-box" id="yext-plugin-box">
					<div class="yext-plugin-item">
						<div class="yext-plugin-title">小工具</div>
						<button id="yext-get-all-email">获取所有邮箱</button>
					</div>
					<div class="yext-plugin-item">
						<div class="yext-plugin-title">搜索辅助</div>
						<div id="yunser-search-box" class="yunser-search-box"></div>
					</div>
				</div>
			</div>
		</div>
	`
	let body = document.body
	body.appendChild($root)
	document.querySelector('#yext-get-all-email').addEventListener('click', () => {
		let matchs = document.body.innerHTML.match(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/g)
		console.log('matchs', matchs)
		if (!matchs.length) {
			showToast('没有找到邮箱')
			return
		}
		chrome.runtime.sendMessage({
			type: 'type_editText',
			data: matchs.join('\n')
		}, res => {
		})
	})
}

dealPlugins()

function initInHtml() {
    console.log('初始化 HTML')
    chrome.runtime.sendMessage({
		type: 'getPassword',
		host: location.host
	}, res => {
		// console.log('收到来自后台的回复：', res)
		// for (let item of res) {
		// 	setPageStyle(item.id, item.style)
		// }
    })
    
	dealPassword()
	dealSite()
}

require('./password')
require('./search')
require('./image')
require('./drag')
require('./key')
