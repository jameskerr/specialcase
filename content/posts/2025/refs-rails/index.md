---
title: "DOM IDs are a real pain in my apps"
date: 2025-09-17T10:42:40-07:00
draft: false
tags: ["Rails", "Hotwire"]
---

The standard way to dynamically update HTML content in Ruby on Rails relies heavily on DOM IDs. These IDs are used to identify the target HTML element for an update. The ID must be present on the original page, and in the subsequent partial updates.

Here's a very simple example of replacing content with a turbo stream.

```html
<form id="settings_form"></form>
```

```rb
turbo_stream.replace "settings_form", ...
```

To me, this is a problem. My faulty human memory is tasked with keeping these IDs in sync. I will inevitably misspell an ID or forget to update an instance during a rename and won’t encounter the bug until I manually click test through the page update.

During my work on [Tend Cash](https://tend.cash) over the last 2 years, I've tried to mitigate this. First I reached for the view_component gem, then tried regular view helpers, and finally created my own simple solution inspired by the way React manages [references to HTML elements](https://react.dev/learn/referencing-values-with-refs#refs-and-the-dom).

## Solution 1: view_component

Using the [view_component](https://github.com/ViewComponent/view_component) gem, I could encapsulate the ID within the component class. This allowed me to reference it within the template and in the controller during an update.

```rb
class SettingsFormComponent
  def id = "settings_form"
end
```

```html
<form id="<%= id %>"></form>
```

```rb
turbo_stream.replace SettingsFormComponent.new.id
```

This was a little awkward because I needed the ID in the instance and on the class essentially. Too much overhead just to help with an ID.

## Solution 2: View Helpers

Next I went back to the defaults and just made [view helpers](https://guides.rubyonrails.org/action_view_overview.html#overview-of-helpers-provided-by-action-view) to keep the IDs safe.

```rb
def settings_form_id = "settings_form"
```

```html
<form id="<%= settings_form_id %>"></form>
```

```rb
turbo_stream.replace settings_form_id
```

But I was longing for something better. At this point, I noticed that the method names and DOM ID strings were always the same. Some metaprogramming could help me avoid all that double typing. I wished for something that worked like this.

```rb
Refs.define do
  ref :settings_form
end
```

```html
<form id="<%= ref.settings_form %>"></form>
```

```rb
turbo_stream.replace ref.settings_form
```

## Final Solution: Refs

And that's what I'm using today. I made a very small library inspired by React's concept of a "ref". In React, a ref is a way to grab an HTML element without needing a string identifier.

First I define all my string DOM IDs in a file called `config/refs.rb`.

```rb
Refs.define do
  ref :settings_form
end
```

Then in my views and controllers I have access to this "ref" object with methods that match the identifiers I've defined.

```html
<form id="<%= ref.settings_form %>"></form>
```

```rb
turbo_stream.replace ref.settings_form
```

If a reference doesn't exist, I get an error in Ruby when the template is being rendered. Much better.

## How It Works

Here's all of the code to copy & paste as you desire.

```rb
# lib/refs.rb
class Refs
  def self.ref(name)
    define_method(name) { name.to_s }
  end

  def self.define(&block)
    class_eval(&block) if block_given?
  end

  def self.instance
    @instance ||= new
  end
end
```

```rb
# app/controllers/application_controller.rb
def ref = Refs.instance
helper_method :ref
```

```rb
# config/initializers/refs.rb
Rails.application.config.to_prepare do
  load Rails.root.join("lib", "refs.rb")
  load Rails.root.join("config", "refs.rb")
end
```

```rb
# config/refs.rb
Refs.define do
  ref :settings_form
end
```

## A New Ruby Gem: refs-rails

I've packaged up the code above into a ruby gem called [refs-rails](https://github.com/jameskerr/refs-rails). Enjoy.

Are you dealing with this ID problem in another way? I'd love to hear about it. Please reach out.
