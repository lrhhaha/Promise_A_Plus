const PENDING = 'PENDING',
      FULFILLED = 'FULFILLED',
      REJECTED = 'REJECTED'

// 用于判断并处理then函数中，回调函数的返回值是否是promise
function resolvePromise(promise2, x , resolve, reject){
  let called = false

  if(promise2 === x){
    return reject(new TypeError('Chaining cycle detected for promise #<MyPromise>'))
  }
  //2.3.3
  if((typeof x === 'object' && x !== null) || typeof x === 'function'){
    // 2.3.3.2
    try{
      //判断出x是对象或函数之后，就认为x可能为promise
      let then = x.then
      if(typeof then === 'function'){
        //认为x确实是一个promise（但其实也可能是thenable对象）
        then.call(x, (y) => {
          if(called) return
          called = true
          // resolve(y)
          resolvePromise(promise2, y, resolve, reject)
        }, (r) => {
          if(called) return
          called = true
          reject(r)
        })
      }else{
        resolve(x)
      }
    }catch(e){
      if(called) return
      called = true
      reject(e)
    }
  }else{
    resolve(x)
  }
}

class MyPromise{

  constructor(executor){
    this.status = PENDING
    this.value = undefined
    this.reason = undefined

    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    // prototype上的resolve和reject方法
    const resolve = (value) => {
      if(this.status === PENDING){

        if(value instanceof MyPromise){
          value.then((x) => {
            resolve(x)
          }, reject)
          //等价于
          // value.then(resolve, reject)
          return 
        }

        this.status = FULFILLED
        this.value = value
        //发布 (在此处设置延时器，可以取代现有方案实现微任务，并通过A+规范测试)
        // setTimeout(() => {
          this.onFulfilledCallbacks.forEach(fn => fn())
        // },0)
      }
    }
    const reject = (reason) => {
      if(this.status === PENDING){
        this.status = REJECTED
        this.reason = reason
        //发布(在此处设置延时器，可以取代现有方案实现微任务，并通过A+规范测试)
        // setTimeout(() => {
          this.onRejectedCallbacks.forEach(fn => fn())
        // },0)
      }
    }

    try{
      //这里是调用使用者提供的回调函数，并且提供两个函数供其使用
      executor(resolve, reject)
    }catch(e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected){
    // 赋默认值，以便穿透
    onFulfilled = typeof onFulfilled == 'function' ? onFulfilled : (value) => value
    onRejected = typeof onRejected == 'function' ? onRejected : (reason) => {throw reason}

    let promise2 = new MyPromise((resolve, reject) => {
      // 回调的返回值，可能是普通值，也可能是promise
      if(this.status === FULFILLED){
        // 文档3.1  为了能取到promise2
        setTimeout(() => {
          try{
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          }catch(e){
            reject(e)
          }
        }, 0)
      }
      if(this.status === REJECTED){
        setTimeout(() => {
          try{
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          }catch(e){
            reject(e)
          }
        }, 0)
      }

      if(this.status === PENDING){
        //收集所有成功和失败的回调(订阅)
        this.onFulfilledCallbacks.push(() => {
          //设置延时器以实现微任务的要求
          setTimeout(() => {
            try{
              let x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            }catch(e){
              reject(e)
            }
          }, 0)
        })

        this.onRejectedCallbacks.push(() => {
          //设置延时器以实现微任务的要求
          setTimeout(() => {
            try{
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            }catch(e){
              reject(e)
            }
          }, 0)
        })
      }

    })
    return promise2
  }

  catch(errorCallback){
    return this.then(null, errorCallback)
  }
}

MyPromise.defer = MyPromise.deferred = function(){
  let deferred = {}

  deferred.promise = new MyPromise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })

  return deferred
}

module.exports = MyPromise