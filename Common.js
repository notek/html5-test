(function(w, d, undefined) {

	//运动算法因子
	var moves = {

		linear: function(t,b,c,d) {
			return c * t / d + b; 
		},

		circ: {
			ei: function(t,b,c,d){
				return -c * (Math.sqrt(1 - ( t /= d ) * t ) - 1) + b;
			},
			eo: function(t,b,c,d){
				return c * Math.sqrt(1 - (t = t / d - 1 ) * t) + b;
			},
			eio: function(t,b,c,d){
				if (( t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
				return c / 2 * (Math.sqrt(1 - (t -= 2)*  t) + 1) + b;
			}
		},

		elastic: {
			ei: function(t,b,c,d,a,p){
				if (t == 0) return b;  if (( t /=d ) == 1) return b + c;  if (!p) p = d * .3;
				if (!a || a < Math.abs(c)) { a = c; var s = p / 4; }
				else var s = p / (2 * Math.PI) * Math.asin(c / a);
				return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		  },
			eo: function(t,b,c,d,a,p){
				if (t == 0) return b;  if ((t /= d) == 1) return b + c;  if (!p) p = d * .3;
				if (!a || a < Math.abs(c)) { a = c; var s = p / 4; }
				else var s = p / (2*  Math.PI) * Math.asin(c / a);
				return (a * Math.pow(2,-10 * t) * Math.sin( (t * d - s) * (2 * Math.PI) / p ) + c + b);
		  },
			eio: function(t,b,c,d,a,p){
				if (t == 0) return b;  if (( t /= d / 2) == 2) return b + c;  if (!p) p = d * (.3 * 1.5);
				if (!a || a < Math.abs(c)) { a = c; var s = p / 4; }
				else var s = p / (2 * Math.PI) * Math.asin(c / a);
				if (t < 1) return -.5 * (a * Math.pow(2,10 * (t -= 1)) * Math.sin( (t * d - s) * (2 * Math.PI)/p )) + b;
				return a * Math.pow(2,-10 * (t -= 1)) * Math.sin( (t * d - s) * (2 * Math.PI)/p ) * .5 + c + b;
		  }
		},

		back: {
			ei: function(t,b,c,d,s){
				if (s == undefined) s = 1.70158;
				return c * (t /= d) * t * ((s + 1) * t - s) + b;
			},
			eo: function(t,b,c,d,s){
				if (s == undefined) s = 1.70158;
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			},
			eio: function(t,b,c,d,s){
				if (s == undefined) s = 1.70158; 
				if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
				return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
			}
		},

		bounce: {
			ei: function(t,b,c,d){
				return c - moves.bounce.eo(d - t, 0, c, d) + b;
	  		},
			eo: function(t,b,c,d){
				if ((t /= d) < (1 / 2.75)) {
	    			return c * (7.5625 * t * t) + b;
	   			} else if (t < (2/2.75)) {
	 				return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
	   			} else if (t < (2.5/2.75)) {
	 				return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
	   			} else {
	 				return c * (7.5625 * (t -= (2.625/2.75)) * t + .984375) + b;
	   			}
	  		},
			eio: function(t,b,c,d){
	   			if (t < d / 2) {
	   				return moves.bounce.ei(t * 2, 0, c, d) * .5 + b;
	   			} else {
	   				return moves.bounce.eo(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
	   			}
	  		}
		}

	};

	w.$$ = {

		/* start */

		//绑定事件
		on:function(on, fn, obj, isBubble) {

			if(!obj instanceof Array || !obj.length) {

				if(obj.addEventListener) {
					obj.addEventListener(on, fn, false);
				}else {
					obj.attachEvent('on' + on,function() {
						fn.call(obj);
					});
				}

			}

			if(obj instanceof Array && obj.length) {

				for(var i=0,len=obj.length; i<len; i++) {
					if(obj[i].addEventListener) {
						obj[i].addEventListener(on, fn, false);
					}

					if(obj[i].attachEvent) {
						obj[i].attachEvent('on' + on,(function(x) {
							return function() {
								fn.call(obj[x]);
							};
						})(i));
					}
				}

			}
			
		},

		//浏览器类型检测与版本号
		browser:function() {

			var ua = w.navigator.userAgent.toLowerCase();

			return {
				
				//browser name
				n:{
					ie:/msie/.test(ua) && d.all ? true : false,
					safari:/safari/.test(ua) && !/chrome/.test(ua),
					opera:/opera/.test(ua),
					chrome:/chrome/.test(ua),
					firefox:/firefox/.test(ua)
				},

				//browser version
				v:{
					ver:null,
					ie:(this.ver = ua.match(/msie\s*[\d.]+/)) && this.ver[0],
					opera:(this.ver = ua.match(/opera\/[\d.]+/)) && this.ver[0],
					chrome:(this.ver = ua.match(/chrome\/[\d.]+/)) && this.ver[0],
					safari:(this.ver = ua.match(/safari\/[\d.]+/)) && this.ver[0],
					firefox:(this.ver = ua.match(/firefox\/[\d.]+/)) && this.ver[0]
				}

			}

		}(),

		css: function(obj, attr, value) {

			if(arguments.length === 2) {
				return attr === 'opacity' ? Math.round(parseFloat(obj.currentStyle ? obj.currentStyle[attr] : document.defaultView.getComputedStyle(obj, false)[attr]) * 100) : 
											obj.currentStyle ? obj.currentStyle[attr] :  document.defaultView.getComputedStyle(obj, false)[attr];			
			}else {
				obj.style[attr] = value;	
			}

		},

		/*
			#单属性多种动画
			
			参数对象attrs
			属性:
				{ 
					attr:动画属性,
				    movetype:动画类型,
				    mode:动画方式, 
				    targets:动画目标点,
				    times:动画帧数(1000 / times),
					rate:动画速率, 
					shield:屏蔽错误信息(默认false),
				    process:动画完成后回调函数
				}

		 */
		animation: function(moveEle, attrs) {

			//速率，默认0.5
			attrs.rate = attrs.rate || .5;

			//屏蔽错误信息，默认false
			attrs.shield = attrs.shield || false;

			//动画帧数，默认1000 / 5 (每秒200帧)
			if(attrs.times === undefined) {

				attrs.times = 5;

			}

			//t:开始时间 d:持续时间(帧速率) b:初始值
			var t = 0, b = parseInt( this.css(moveEle, attrs.attr) ), d = (attrs.targets - b) * attrs.rate;

			if(!attrs.shield) {

				if(typeof attrs !== 'object') {
					throw new Error('参数错误.Parameter error');
					return;
				}

				if(attrs.movetype === 'linear' && attrs.mode) {
					throw new Error('linear没有运动模式.Linear no sport mode');
					return;
				}

			}

			switch(attrs.attr) {

				case 'top':
				case 'left':
				case 'right':
				case 'bottom':
				case 'width':
				case 'height':	
				case 'marginLeft':
				case 'marginRight':
				case 'marginTop':
				case 'marginBottom':
				moveEle.timer && clearInterval(moveEle.timer);

				moveEle.timer = setInterval(function() {

					t < d ? t++ : t--;

					//动画赋值
					if(attrs.movetype !== 'linear') {

						moveEle.style[attrs.attr] = Math.ceil( moves[attrs.movetype][attrs.mode](t, b, attrs.targets - b, d) ) + 'px';

					}else {

						moveEle.style[attrs.attr] = Math.ceil( moves[attrs.movetype](t, b, attrs.targets - b, d) ) + 'px';

					}

					//动画完成
					if( parseInt(t, 10) === parseInt(d, 10) ) {

						clearInterval(moveEle.timer);
						moveEle.style[attrs.attr] = attrs.targets + 'px';
						attrs.process && attrs.process();

					}

				}, attrs.times);

				break;

				default:
					throw new Error('不支持该属性.This attribute is not supported');
			}

		},

		//多属性缓冲动画
		buffer:function(moveEle, targets, times, callback) {

			if(moveEle.timer) clearInterval(moveEle.timer);

			//动画帧数，默认1000 / 15 (每秒大约66帧)
			if(times === undefined) {
				times = 15;
			}

			if(typeof targets !== 'object') {
				throw new Error('参数错误.Parameter error');
				return;	
			}

			var _this = this;

			moveEle.timer = setInterval(function() {

				var speed = pro = 0, stops = true;

				for(var attr in targets) {

					pro = parseInt(_this.css(moveEle,attr));

					if(String(targets[attr]).indexOf('%') != -1) {

						targets[attr] = '' + parseInt(parseInt(targets[attr]) / 100 * pro);

					}else {

						targets[attr] = targets[attr];

					}

					speed = (targets[attr] - pro) / 10;
					speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);

					(pro != targets[attr]) && (stops = false);

					attr == 'opacity' ? (moveEle.style.opacity = (pro + speed) / 100, moveEle.style.filter = 'alpha(opacity:' + (pro + speed) + ')') : moveEle.style[attr] = pro + speed + 'px';	
				
				}

				stops && (clearInterval(moveEle.timer), moveEle.timer = null, callback && callback.call(moveEle));	

			}, times);
		},

		//单击切换事件
		toggle:function(obj) {

			var _arguments = arguments;

			(function(count) {
				obj.onclick = function() {
					count >= _arguments.length && (count = 1);
					_arguments[count++ % _arguments.length].call(obj);	
				}	
			})(1);

		},

		//获取给定元素下的class元素
		getParentInClass:function(par,classN) {
			par = par || doc;
			var eles = par.getElementsByTagName('*'), result = [], len = eles.length,
				reg = new RegExp('\\b'+ classN +'\\b','g');
			for(var i=0; i<len; i++) {
				eles[i].className.match(reg) && result.push(eles[i]);	
			}
			return result;
		},

		//获取第一个元素
		first:function(eleList) {
			return eleList[0];
		},

		//获取最后一个元素
		last:function(eleList) {
			return eleList[eleList.length - 1];	
		},

		//清除字符串前后空行
		trim:function(str) {
			return str.replace(/^\s*|\s*$/g,'');
		},

		//ajax方法
		ajax:function(type,url,callback,val) {
			var str = '',
				xhr = w.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
			if(type === 'post') {
				if(typeof val !== 'object') {
					alert('请以json格式传入val');	
					return;
				}else {
					for(var key in val)	{
						str += key + '=' + val[key] + '&';
					}
				}
				str = str.replace(/&$/, '');
				xhr.open(type,url,true);
				xhr.onreadystatechange = processData;
				xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
				xhr.send(str);		
			}
			type === 'get' && (xhr.open(type,url,true), xhr.onreadystatechange = processData, xhr.send(null));
			//放置返回值
			function processData() {
				xhr.readyState == 4 && xhr.status == 200 ? callback && callback(xhr.responseText) : callback && callback(0);
			}
		},

		//扩展方法,每个扩展方法只能定义一次,定义多次的扩展方法将会报错(不允许覆盖)
		plug:function() { 

			for(var name in this) {
				if(arguments[0] === name) {
					throw new Error('方法已存在.Methods already exist');
					return;
				}
			}

			this[arguments[0]] = arguments[1];

		}

		/* end */

	}

})(window, document);