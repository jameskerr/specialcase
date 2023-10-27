---
title: "How to Optimize Your Hugo Blogging Workflow on Mac"
date: 2023-10-27T09:22:36-07:00
description: I like Hugo because it's free, fast, and fun to develop. But look at all these hurdles I had to jump when publishing!
draft: false
---

I love this quote by John Cutler from his post on [disincentives](https://cutlefish.substack.com/p/tbm-3752-disincentives).

> "Good things can happen when you make it easier to do good things." --John Cutler

He advises to focus less on incentivizing desired behavior, and more on removing disincentives from desired behavior. It's brilliant.

My desired behavior is to write more posts on my [Hugo](https://gohugo.io/) blog. 

I like Hugo because it's free, fast, and fun to develop. But look at all these hurdles I had to jump when publishing!

1. Open a terminal
2. Type `hugo new posts/my-interesting-post`
3. Remember 👆 syntax since I don't do it frequently
4. Open the new file in a markdown editor
5. 🌟 WRITE THE WORDS (desired behavior)
6. Back to the terminal
7. Run `hugo serve` to preview
8. Open up the browser
9. Navigate to `localhost:1313`
8. Back to the terminal to `git add .` `git push`
9. Thankfully, Netlify will automatically deploy on push

Here's how I removed all that friction.

## macOS Shortcuts

{{< figure src="shortcuts.png" height="120px" >}}

I used the macOS Shortcuts app to automate the steps above. Then I put the shortcut icons in my dock for a "one-click" experience.

Here's my new workflow.

1. One click to start writing a new post.\
{{< figure src="new-post-button.png" height="120px" >}}
2. One click to preview it a browser.\
{{< figure src="preview-button.png" height="120px" >}}
3. One click to publish.\
{{< figure src="publish-button.png" height="120px" >}}


## It Worked!

I'm writing much more now that I've got these buttons. Here are screenshots showing you how to set these up for yourself.

## 1. 'New Post Bundle' Shortcut

{{< figure src="new-post-shortcut.png" >}}

{{< note "What's going on here?" >}}
1. The first action prompts me for the title text
1. Then the second action has my response in the $1 variable
2. Change directory in my blog
3. Run `hugo new posts/$1`
4. Open my markdown editor iA Writer

Notice I had to write the full path to the `hugo` binary. Not sure why.
{{< /note >}}

## 2. 'Preview Blog' Shortcut

{{< figure src="preview-shortcut.png" >}}

{{< note "What's going on here?" >}}
1. First I kill all exisiting `hugo` processes
2. Change directory into the blog
3. Run `hugo serve &` putting the server process in the background
								4. Then I open localhost:1313 in the default browser
{{< /note >}}

## 3. 'Publish Blog' Shortcut

{{< figure src="publish-shortcut.png" >}}

{{< note "What's going on here?" >}}
1. Changes directory into blog
2. Git add everything
3. Push it to main

Is there an app that makes confetti fall from the top of the screen? That's the missing piece of this shortcut.
{{< /note >}}

## Video Demo

To see this all in action, here's a video of me creating, writing, and publishing this exact post that you're reading! Enjoy.