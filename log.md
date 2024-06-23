# TypeCoach

## 2020-06-23

Current situation: accuracy is dgishit and not nitceabky improving. Slowing
myself down is too painful: I get angry, and my accuracy merely decreases.

Ideas?

- work with a vocabulary
- capitals, spaces and interpunction: not sure if those variations should be
  treated as seprate words, or as variant of one word
- every time a mistake is made, return to the start of a word with a loud noise,
  force repetititon of entire words
- count the rehearsals required for scoring
- maybe have a way to move on to phrases

What is the key here? To isolate and rehearse the inaccurate parts, hoping the
mistakes are not random.

Maybe it is just a matter of sarting with short exercises and gradually
increasing their length. However, combinatory explosion is a bitch.

Scoring per letter based on how often you trip up on words that contain them...
That fails to notice trippy pairs.

My accuracy is frustrating me as I type these sentences. Fuck!

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
