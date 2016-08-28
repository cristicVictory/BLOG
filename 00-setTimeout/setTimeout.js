context、this、异步、浏览器线程
浏览器假死、EventLoop、单线程模型

/**
 * ============================================================================
 * ,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'
 * ============================================================================
 */
/**
 * 从业务场景启发思考
 * 
 */
1.微信的title修改
解决办法：
    changeWeiChatTitle:function(title,pic){
        document.title =  title;
        // hack微信等webview中无法修改标题
        var iframe = document.createElement('iframe');
        iframe.setAttribute('src', pic);
        iframe.addEventListener('load', function () {
            setTimeout(function(){document.body.removeChild(iframe)},0) ;
        });
        document.body.appendChild(iframe);
    }
    简单理解：一定要加setTimeOut,否则微信的title渲染不稳定。当iframe加入浏览器，没有setTimeOut可能立马，被remove了，
    浏览器可能还没有来得及反应，但是加了setTimeOut，就相当于给浏览器的反应时间。
2.setTimeout 点击tap穿透的问题

方案一：fastclick.js

方案二：用touchend代替tap事件并阻止掉touchend的默认行为preventDefault()

     $("#cbFinish").on("touchend", function (event) {
     //很多处理比如隐藏什么的
     event.preventDefault();
     });
方案三：延迟一定的时间(300ms+)来处理事件
     $("#cbFinish").on("tap", function (event) {
     setTimeout(function(){
     //很多处理比如隐藏什么的
     },320);
     });

 3.setTimeout闪屏问题
    做一个toggle的效果，会出现闪屏的效果
    if($('.js-click-actived').hasClass('actived')){
            $('.js-click-actived').removeClass('actived');
    }else{

            $('.js-click-actived').addClass('actived');
    }
    加上setTimeout可以进一步控制，能给浏览器时间进行渲染和反应
    原理应该就是线程问题 和线程假死问题
    if($('.js-click-actived').hasClass('actived')){
        setTimeout(function(){
            $('.js-click-actived').removeClass('actived');
        },10);
    }else{
        setTimeout(function(){
            $('.js-click-actived').addClass('actived');
        },10);
    }
/**
 * ============================================================================
 * ,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'
 * ============================================================================
 */
/**
 * 从环境变量context，解释
 */
20.从环境变量context和this，解释setTimeout的现象
案例一、
        setTimeout(function() {
          console.log('hello world');
        }, 1000);
        while(true) {};
从上到下开始执行，遇到setTimeout 鼠标的点击事件、ajax等事件，异步执行他们，此时并不会影响代码主题继续往下执行，一旦异步事件执行完，
回调函数返回，将它们按次序加到执行队列中。此时，如果主体代码没有执行完的话，是永远不会触发callback,由此会导致页面假死的情况

案例二、
        var x = 1;
        var o = {
            x: 2,
            y: function(){
                console.log(this.x);
            }
        }
        setTimeout(o.y,1000);
        setTimeout推迟执行的回调函数中的this
    如果被setTimeout推迟执行的回调函数是某一个对象的方法，那么该方法中的this关键字指向全部的环境，而不是定义时所在的那个对象

案例三：
        var x = 1;
        var o = {
            x: 2,
            y: function(){
                console.log(this.x);
            }
        }
        setTimeout(o.y.bind(o),1000);
        //apply call也可以，试一下
        setTimeout(o.y.apply(o),1000);
        setTimeout(o.y.call(o),1000);
        用bind修改所在的上下文环境，可以解决案例二带来的问题。
说明：如果setTimeout出现没有对象等问题，可以直接调试注意当前this指代的是什么，还有当前的环境是哪个

/**
 * ============================================================================
 * ,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'
 * ============================================================================
 */
/**
 * 相关机制的理解
 * 1.运行机制
 * 2.setTimeout(f,0)
 * 3.单线程模型
 */
运行机制
    setTimeout 和setInterval 的运行机制是，将指定的代码移除本次的执行，等到下一轮EventLoop时，再检查是否到了指定的时间。如果到了，就执行对应的代码；
    如果不到，就等下一轮的EventLoop时重新判断
    setTimeout(someTask,1000)
    veryLongTask()
    上面代码的setTimeout，指定1000毫秒以后运行一个任务。但是，如果后面立即运行的任务（while(true) {}）非常耗时，
    过了1000毫秒还无法结束，那么被推迟运行的someTask就只有等着，等到前面的veryLongTask运行结束，才轮到它执行。
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
setTimeout(f,0)
    setTimeout的作用是将代码推迟到指定时间执行，如果当前设定的时间为0，那么也不会立即执行
    必须等到当前脚本的同步任务和“任务队列”中已有的事件，全部处理完以后，才会执行setTimeout指定的任务
    setTimeout真正的作用是 在消息队列上面添加一个消息，规定在指定时间执行某段代码
    setTimeout(f,0) 表示是尽可能早的执行这个任务
------------------------------------------------------------------------------------------------------------------------------------------------------------------------
单线程模型
    javascript采用的是单线程模型
    单线程模型带来的问题，主要是新的任务被添加在队列尾部，只有前面所有的任务运行结束，才会轮到它执行。如果有一个任务特别耗时，后面的任务都会停在那里等待，造成了
    浏览器失去响应，又称为假死。所以javascript内部使用了EventLoop的机制进行处理。
    EventLoop是一个程序结构，用于等待和发送消息和事件。

/**
 * ============================================================================
 * ,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'`'-.,.-'
 * ============================================================================
 */





