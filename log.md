# TypeCoach

## 2024-05-09

### todo

- tests
- scoring persistence

### alternatives

## 2024-05-08

### todo

- ~~scoring mechanism~~
- scoring persistence...
- ~~key press handler~~
- ~~velocity indicator~~
- priority queue tests

### accumulate errors

So how should this work? count the number of times you mistype? Decrement the
penalty by one on each test, but increment with each error.

## 2024-05-06

Help with blind typing. Alternative exercises to what is ordinarily offered. To
be precise: Use a priority queue with regular updates to focus on keys that seem
to give trouble, in the sense that they cause mistakes or take a long time.

I have a div that changes color when it is ready to receive keypresses, and a
key down callback.

The div shows the next letter(s) to type (what is ideal between 1 and 64?) based
in velocity and mistakes, the letter is reprioritized and reinserted in the
queue.

### todo

- priority queue
- scoring mechanism
- scoring persistence...
- key press handler
- velocity indicator (median over last n presses? how many in the last minute?
  means and median over the presses in the last minute?)
