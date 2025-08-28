const MyPromise = require('./MyPromise.js')

// let promise = new MyPromise((resolve, reject) => {
//   //对于这种情况，我们没有取到里面promise传递的resolve()中的参数，
//   //而且直接将新的peomise当成了参数
//   resolve(new MyPromise((resolve, reject) => {
//     setTimeout(() => {
//       resolve('hahahha!!~~~')
//     }, 2000)
//   }))

// })

// promise.then(value => {
//   console.log(value)
// })


// 这里是两个形参
let p = new MyPromise((resolve, reject) => {
  // setTimeout(() => {
    resolve('haha')
  // }, 2000)
})

p.then((value) => {
  console.log(value);
})

