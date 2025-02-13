---
title: "SuperDB Website Build Review"
date: 2025-02-13T10:57:27-08:00
draft: false
tags: ["hugo"]
---

My work designing and developing the [superdb.org](https://superdb.org) website is finished. The first commit was on October 4th, 2024 and the final commit was on February 5th, 2025. It took 4 months of work with some holidays mixed in.

{{< figure src="landing.png" link="./landing.png">}}

The landing page was the first thing I designed. I only planned to make a marketing site with a blog for the project, but later decided to include the docs as well.

Last year, my company decided to change the name of our project from Zed to SuperDB. It was an exciting moment. Communicating what we are building became so much easier. That “DB” at the end signals where we fit in the market.

{{< figure src="comic.png" link="./comic.png">}}

I played off the word "super" and ran with a superhero theme. I took inspiration from this Superman comic book, borrowing the colors, the 3D text, and “WHAM-O!” speech bubbles. It was a fun one to develop.

[Rig Sans](https://jamieclarketype.com/project/rig-sans) was the font I chose for body and headings. I picked a yellow accent color with red and blue secondary accents. No one ever asks for a “light mode”, so I themed it dark from the start.

The old docs site contained over 100 pages of content. It got built using Docusaurus. There are quite a few things I don't care for about Docusaurus (and all React-Based website builders). They make me relearn everything I know about building websites. I need to use their a brand new way to include a “script” tag for instance. The class names in Docusaurus are unreadable (they fixed this in recent versions), the way to extend it (swizzling) is complicated, and it’s slow to build because JavaScript does the building.

This was the old site.

{{< figure src="zed-docs.png" link="./zed-docs.png">}}

At this stage of my life, I’m drawn to simple, stable tools. I lean into vanilla HTML, JS, and CSS as much as I can. They are pretty freaking good now.

I use [Hugo](https://gohugo.io/) for all my static site needs. It has downsides as well, but at least it’s fast, it lets me write standard HTML, CSS, and JS, and gives me good data structures for pages, sections, menus, markdown, metadata, and partials. The downside is having to write Go templates. It’s an awkward and verbose language. But the upsides are too good, so I’m getting over it.

While working on this, I discovered even more features of Hugo like the [virtual union file system](https://gohugo.io/getting-started/directory-structure/#union-file-system). That allowed me to render the docs in the site without moving the files into the website folder.

```
[[mounts]]
  source = "../super/docs"
  target = "content/docs"
```

I learned how to provide a [custom renderer for code blocks](https://gohugo.io/render-hooks/code-blocks/). This let me render an interactive playground based on a block of code in the markdown.

The code in this file…

{{< figure src="file-system.png" link="./file-system.png">}}
￼
…will turn this code block in the markdown…

{{< figure src="markdown.png" link="./markdown.png">}}
￼
…into this interactive playground on the website!
￼
{{< figure src="playground.png" link="./playground.png">}}

I used [@hotwired/turbo](https://turbo.hotwired.dev/) for all JavaScript interactions. It paired very nicely with Hugo.

I learned that everything you setup in the `"turbo:load"` event must get torn down in the `"turbo:before-cache”` event. I felt pretty clever after discovering that -- until I stumbled across this [post at better-stimulus](https://betterstimulus.com/integrating-libraries/lifecycle). The "good" way to integrate JS libraries is with a stimulus controller using the `connect()` and `disconnect()` callbacks. I also learned that each time you add `data-controller=“my-controller”`, that element is attached to a single instance of the controller. Good to know.

I got to play around with new more vibrant colors like this:

```css
@supports (color: oklch(0% 0 0)) {
  :root {
    --color-accent: oklch(0.93 0.2 102);
    --color-accent-2: oklch(0.68 0.27 30.01 / 1);
  }
}
```

That overrides my previous color variables with the new fancy ones.

The biggest question mark I had about the project was how to support multiple documentation “versions”. Hugo did not let me down. It took some deeper understanding of the data structures, but I had all the tools I needed. When I needed to build the versions dropdown popover, I reached for the css anchor positioning spec and [grabbed a polyfill](https://anchor-positioning.oddbird.net/) so that I could use the future syntax. I can’t wait until that is supported everywhere (as well as scroll animations).

The final discovery to share is how I got the GitHub Star count in the header. Instead of using JavaScript to fetch the number after the page loads, I used Hugo to make the HTTP request at build time. The downside is that the number only gets updated when you deploy the site, but I like that no JS is involved. It's pretty easy to trigger a deploy these days.

Here was my template to grab the star count.

```go
{{ template "utils/star_count.html" "brimdata/super" }}
```

And the implementation.

```go
{{ $url := fmt.Printf "https://api.github.com/repos/%s" . }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else }}
    {{ $data := .Value | transform.Unmarshal }}
    {{ $count := $data.stargazers_count }}
    {{ if gt $count 1000 }}
      {{ $thousands := math.Div $data.stargazers_count 1000 }}
      {{ fmt.Printf "%.1f" $thousands }}k
    {{ else }}
      {{ $count }}
    {{ end }}
  {{ end }}
{{ else }}
  {{ errorf "Unable to get remote resource %q" $url }}
{{ end }}
```

I loved working on this project. Learned a lot. Here's the link again. Check it out.

[superdb.org](https://superdb.org)
