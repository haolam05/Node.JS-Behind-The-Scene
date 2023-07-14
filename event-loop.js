const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();
// does not work on window, need to set the threadpool size b4 the script is executed
// check npm run start
// process.env.UV_THREADPOOL_SIZE = 4;

setTimeout(() => console.log('Timer 1 finished'), 0);
setImmediate(() => console.log('Immediate 1 finished'));

fs.readFile('test-file.txt', () => {
  console.log('I/O finished');
  console.log('=============================');

  setTimeout(() => console.log('Timer 2 finished'), 0);
  setTimeout(() => console.log('Timer 3 finished'), 3000);
  setImmediate(() => console.log('Immediate 2 finished'));
  process.nextTick(() => console.log('process.nextTick()'));

  // Event loop offload cryptography task to threadpool - threadpool = 4 => executed at the same time
  crypto.pbkdf2('password', 'salt', 200000, 1024, 'sha512', () =>
    console.log(Date.now() - start, 'Password encrypted')
  );
  crypto.pbkdf2('password', 'salt', 200000, 1024, 'sha512', () =>
    console.log(Date.now() - start, 'Password encrypted')
  );
  crypto.pbkdf2('password', 'salt', 200000, 1024, 'sha512', () =>
    console.log(Date.now() - start, 'Password encrypted')
  );
  crypto.pbkdf2('password', 'salt', 200000, 1024, 'sha512', () =>
    console.log(Date.now() - start, 'Password encrypted')
  );

  // Synchronous - execute all of these b4 process.nextTick() bc can't exit current phase
  // crypto.pbkdf2Sync('password', 'salt', 100000, 1024, 'sha512');
  // console.log(Date.now() - start, 'Password encrypted');
  // crypto.pbkdf2Sync('password', 'salt', 100000, 1024, 'sha512');
  // console.log(Date.now() - start, 'Password encrypted');
  // crypto.pbkdf2Sync('password', 'salt', 100000, 1024, 'sha512');
  // console.log(Date.now() - start, 'Password encrypted');
  // crypto.pbkdf2Sync('password', 'salt', 100000, 1024, 'sha512');
  // console.log(Date.now() - start, 'Password encrypted');
});
console.log('Top level code');

// Order of execution
// 'Top level code'
// 'Timer 1 finished' and 'Immediate 1 finished' and 'I/O finished'
// '============================='
// 'process.nextTick()'
// 'Immediate 2 finished'
//            4 threadpools
// 'Timer 2 finished'
//  ~1.765 seconds Password encrypted
//  ~1.784 seconds Password encrypted
//  ~1.841 seconds Password encrypted
//  ~1.854 seconds Password encrypted
// 'Timer 3 finished'
//            2 threadpools
// 'Timer 2 finished'
//  ~1.765 seconds Password encrypted
//  ~1.784 seconds Password encrypted
// 'Timer 3 finished'
//  ~3.841 seconds Password encrypted
//  ~3.854 seconds Password encrypted
//
/**
 * 1) Initialize program
 * 2) Execute top-level code:                   'Top level code'
 * 3) Require module:                             fs and crypto
 * 4) Register event callbacks                    setTimeout#1 and setImmediate#1
 *    =>                                        'Timer 1 finished' & 'Immediate 1 finished' & 'I/O finished'
 *    => note that timer#1 and immediate#1 and readFile's order of executions are non-deterministic bc it is bound by the
 *          performance of the process. (we set them 1 line after another and there is no synchronous starting point)
 *          For timer#2, timer#3, immediate#2, they have synchrnous starting point (at I/O phase)
 *    => so, they will be executed in any random order, but readFile is more likely to be last bc the test-file.txt is huge
 * 5) Start event loop
 *    i)  Expired timer callbacks
 *      => timer#2, timer#3 and immediate#2 won't be registered until the file is finished reading which is in (ii)
 *      => setImmediate will be executed after I/O - step (ii) => 'Immediate 2 finished' will be printed b4 timer#2 and timer#3
 *    ii) I/O polling and callbacks
 *      => register for timer#2, timer#3, immediate#2, and nextTick()
 *      => nextTick is executed right after current phase
 *                                               'process.nextTick()'
 *    iii) setImmediate callbacks                'Immediate 2 finished'
 *    iv) close callbacks
 *    -> still have pending timers -> back to (i)
 *    ->                                         'Timer 2 finished'
 *    ->                                         'Timer 3 finished'
 */
