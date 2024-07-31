# TypeCoach

## 2024-07-31

### ideas

- select characters: select only words that contain certain difficult characters
- circular exercise: no jump back, but everything up to that point does not
  count anymore, so the exercise wraps around when reaching the end. Could be
  done by shifting the string, which might be clearer visually.
- Hold on end. Don't jump to the next exercise right away, so you can relfect on
  your errors.

## 2024-07-28

Debugging powershell script:
`Get-Content wp.txt -Encoding utf8 | Sort-Object -CaseSensitive | Get-Unique | Out-File wp2.txt -Encoding utf8`

## 2024-07-27

### Current status

algorithm generates a text of roughly 200 chars by randomly picking words.

- every error sets you back to the start.
- the text is perisited locally, so you can return to it.
- a green background shows your current position.
- a red background shows how far you got before the fruther error
- error are listed below
- a light grey text means the app is not listening to input

I dropped the idea of a genetic algorithm or whatever in favor of this. I need
to be reminded that 200 corretc characters in a row is an option

### Command line utilities

Using texts from Gutenberg. For getting a word list to work with:
`gc wp.txt | Sort-Object -CaseSensitive | Get-Unique > wp2.txt`

## 2024-07-21

Genetic algorithm. Generate strings that get one error in them, in order to
gradually improve difficulty. The exact process of breaking up, mixing,
mutating, etc. still leaves a lot of options open.

I cannot move myself again because I am unsure what I want. The problem with the
flash card idea, however promising it is, is that there are too many sequences
of characters to type. How do you concentrate on certain features?

- different format: shorter exercises, but any fail means trying again from
  start
- fitness: could have 2 kinds of fitness, i.e. after generation strings, they
  are checked for suitability based on for example, the character classes, how
  often and where they occur relative to each other. Select for normalcy. The
  second fitness is after the exercise: both too difficult and too easy should
  be avoided. Could be done for individual characters as well.

Yes, first select based on whether the strings look normal enough, based on
frequency of upper and lower case. Offer the string for an exercise: no mistakes
means death, otherwise every mistake diminishes the change of contributing to
future generations.

### fine graining

Take the word list, randomly select wordt and join togther with strings. Idea:
the DNA is just the indices into the big array.

Starting point: 40 word strings?

Maybe don't start with the genetic thing just yet, just a string generator.

DNA could be more complicated, i.e. parameters like how many words as metagenes.
Faster selection for how many words.

Intorduce paragraphs separated with retruns...

## 2020-06-23

Current situation: accuracy is dogshit and not noticeably improving. Slowing
myself down is painful: I get angry, and my accuracy merely decreases.

Ideas?

- work with a vocabulary
- capitals, spaces and interpunction: not sure if those variations should be
  treated as separate words, or as variant of one word
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
