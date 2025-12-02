---
title: "It's hard to deny the simple beauty of a function"
date: 2025-12-02T10:08:36-08:00
draft: false
tags: ["ruby", "programming"]
---

I love object-oriented programming. I love naming concepts and materializing them with a class. I love dot notation. I love hiding implementation behind a seemingly simple accessor. I've always leaned a little more on the side of OOP in the holy war against FP.

But the more code I write, the harder it gets to deny the simple beauty of a function. 

> Data in, behavior, data out. 

Everything you need to understand it is at hand; no bouncing around the file to gather the necessary context. It's all right there.

The function is the "aha moment" of learning to program.

As the years went by, I drifted away from using them because they look naive when put next to advanced constructs like classes, meta-programming, design patterns, or inheritance. But a few recent experiences might be changing that.

In Sandy Metz's book [**99 Bottles of OOP**](https://sandimetz.com/99bottles), she shocks readers with her initial implementation of a program to print the lyrics of the famous "99 Bottles of Beer" song.

```ruby
def verse(number)
  case number
  when 0
    "No more bottles of beer on the wall, " +
    "no more bottles of beer.\n" +
    "Go to the store and buy some more, " +
    "99 bottles of beer on the wall.\n"
  when 1
    "1 bottle of beer on the wall, " +
    "1 bottle of beer.\n" +
    "Take it down and pass it around, " +
    "no more bottles of beer on the wall.\n"
  when 2
    "2 bottles of beer on the wall, " +
    "2 bottles of beer.\n" +
    "Take one down and pass it around, " +
    "1 bottle of beer on the wall.\n"
  else
    "#{number} bottles of beer on the wall, " +
    "#{number} bottles of beer.\n" +
    "Take one down and pass it around, " +
    "#{number-1} bottles of beer on the wall.\n"
  end
end
```

Shameless simplicity. I can understand this code instantly. This was her default take and the most legible way to write it, even if it broke away from "best practices".

Just last month at the SF Ruby conference, well-published author Dave Thomas gave his talk about not needing the class construct for much of our programs. His point was, unless you need a bunch of different instances of a thing, use a function.

```ruby
# Dave critiques this common ruby style.
EmailService.new(user).send
# And says why not just write it like this.
EmailService.send(user)
```

I love when people in authority voice something we all intuitively know, but can't put words to for fear of sounding naive. 

> It seems we need permission from respected people just to keep things simple.

And as a Ruby programmer, I've always typed "c" "l" "a" "s" "s" when I wanted to bring something into existence. But today I'll pause and see if the simple function might be a better fit.

```ruby
module Summary
  def self.totals_by_category(scope)
    scope
      .group(:category)
      .sum(:amount)
    # ...
  end
end
```

Someone on the internet remixed Michael Pollan's famous advice about eating food, and it might be good advice to follow: 

Write code, not too much, mostly functions.
