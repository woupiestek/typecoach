# TypeCoach

## 2025-02-01

### difficult letter exercises

1. exercises with randomly selected letters intended to destroy flow
2. perhaps tally errors per letter, to generate harder exercises
3. same recipe though: repeat the exercise until perfect

## 2024-12-23

### updates

- Instead of truncating time at every point, just ignore any breaks at the start
  of an exercise.
- Show linebreaks by substituting spaces with "\u200B\u00A0": zero width space
  before non breaking space.
- Always repeat when errors are made, only repeat more often if the rate is
  getting to high.
- If errors are made at a rate of 0.75 per minute over 30 minutes, and every
  error causes at least one penalty round, then 22.5 is the 'penalty budget',
  the amount the user can afford.

## 2024-11-07

Made several changes now, and I am starting to feel good about this again. As if
I am learning again, instead of fialed the same way over and over. Take on new
challenges. I should just be more patient when thing go badly at the start.

## 2024-11-01

### time based

Something like errors per minute. I think the idea is 150 strokes p/m but only
one error for 200 strokes. I.e. 80s per error. Based on the total time measure,
that ignores breaks.

Now it would be nice if the error rate decreased more smoothly

## 2024-10-28

I cannot understand how bad I am at typing. I've been at it for a year, and know
to find every key. But I keep having to get one key in thirty wrong, and I
cannot understand why. What the hell is worng with me?

## 2024-10-26

Current exercises try to improve accuracy to a level by providing a stretch of
characters of a certain length, implicitily saying: only one error per execise
allowed... But we need to get the rate of errors down.

1. compensation: repeat a sequence of characters until the overall error rate
   gets below the threshold.
2. combine with shorter exercises...

Note: 20 charcter exercises needs to be repeated 10 times to compensate for one
error any new error increases the load by ten. Is that what we want?

So just the exercises we have now, but with a reset until the error rate drops
below the threshold. Shorter exercises require more repetitions when failed.

How about ca 100 characters, one error means one perfect repetition needed.
Maybe there is no sweetspot. Just type the same long text over and over again,
not just until doing it perfect once, but until previous errors have been
compensated for. the current exercises are more than long enough. Still, 40
errors require 8000 strokes, or 40 times redoing the same exercise.

Compromise: cap the error rate to two or three times the target rate, i.e. any
errors beyond that point mean that the exercise was failed, but doesn't ask for
more repetition to move on.

Why do I still suck so hard!?

### 5 chances

Say 1000 characters:

- more than 5 errors: hatespeech on screen and move on
- get below 1 error per 200 at the end: move on.

## 2024-08-15

Zooming in: first truncate the string to a small number of characters around the
mistake, and only start from the beginning later.

Ultimately it should be more work to make a mistake, but broken down into
smaller challenges before returning to the start.

The algorithm could work with a stack of strings to 'complete', or maybe a stack
of offsets and distances, that rises with a mistake and falls when the string is
completed without errors.

## 2024-08-08

Could I add warning signs at certain characters?

Maybe just replace each character with the most common error.

## 2024-08-01

### ideas

Forget about storage. Eventually parameters like length of exercise, set of
characters, preferred characters can be stored to adjust difficulty based on
error rate.

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
