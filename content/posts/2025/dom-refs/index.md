---
title: "Managing DOM Ids in Rails/Hotwire/Turbo"
date: 2025-09-17T10:42:40-07:00
draft: false
tags: ["Rails", "Hotwire"]
---

I am two years into a Rails app using Hotwire for the frontend. Like all frontend systems, the learning curve has been steep. One thing uniquely challenging with Hotwire is managing the DOM id strings.

Turbo streams and turbo frames both rely on DOM ids to replace content on the page. Here's a very simple example of replacing content on page with turbo streams.

```html
<form id="settings_form"></form>
```

```rb
turbo_stream.replace "settings_form", ...
```

Now it's on me and my faulty human memory to keep these ids synced. Exercising turbo streams/frames in unit tests is difficult, so when I inevitably misspell an ID or forget to update an instance during a rename, I won’t encounter the bug until I manually click test through the UI (I’ve given up on system/e2e tests long ago).

I wanted a safe, central way to manage these DOM ids, so I tried installing the view_compnent gem. I could encapsulate the id within the component class, then reference the class's id method wherever I needed it.

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

This would work, but I didn't love having to create components every time I needed a simple id. A little verbose as well.

So I went simpler and just defined the ids in view helpers.

```rb
def settings_form_id = "settings_form"
```

```html
<form id="<%= settings_form_id %>"></form>
```

```rb
turbo_stream.replace settings_form_id
```

I did this for a while, but I kept itching for something better. The method names and the string method body were always the same, which signaled to me some metaprogramming might be in order.

I ended up making a very small library inspired by React's concept of a "ref" - a way to grab an HTML element without needing a string identifier.

Here's how it works. First you define all the string DOM ids in a file called `config/refs.rb`

```rb
Refs.define do
  ref :settings_form
end
```

Then you'll have access to a "ref" object in all your views and controllers like this. Every "ref" you define in the config file is available as method on this object.

```html
<form id="<%= ref.settings_form %>"></form>
```

```rb
turbo_stream.replace ref.settings_form
```

Now I'll get an error in Ruby when the template is being rendered if the reference doesn't exist! The library pretty much just calls `.to_s` on that symbol, stores the pair in a hash, and defines a method on the ref object that returns the string.

Here's all of the code.

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
  load Rails.root.join("lib", "references.rb")
  load Rails.root.join("config", "refs.rb")
end
```

```rb
# config/refs.rb
Refs.define do
  ref :settings_form
end
```

If you'd rather install a gem, here ya go! https://github.com/jameskerr/refs-rails
