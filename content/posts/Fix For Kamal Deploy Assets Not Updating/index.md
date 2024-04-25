---
title: "Fix for Kamal Deploy Assets Not Updating"
date: 2024-04-23T10:31:32-07:00
draft: false
tags: ["ci", "rails", "kamal"]
---

Does this sound like you?

1. You are using Sprockets to pre-compile assets for production.
2. You are using [Kamal](https://kamal-deploy.org) to deploy.
3. You have [asset bridging](https://kamal-deploy.org/docs/configuration/asset-bridging/) enabled in your deploy.yml file.

If that is you, you will find that your assets are not updated about 50% of the time. Randomly.

The fix is to disable asset bridging in deploy.yml.

```yaml
# comment this out 👇
asset_path: /rails/public/assets
```

{{< note "April 25, 2024 Update" >}}
Wait! There is another way to fix this without disabling asset bridging. See the section at the end of this post. But keep reading to understand the problem.
{{< /note >}}

Why?

When the deploy pipeline runs `rails assets:precompile` a file will be created called `.sprockets-manifest-randomhex.json`. This manifest file maps the name of your asset to the digested name that will be used in production for `stylesheet_link_tag` and the like.

From the [Rails Guide:](https://guides.rubyonrails.org/asset_pipeline.html#precompiling-assets)

> The command also generates a .sprockets-manifest-randomhex.json (where randomhex is a 16-byte random hex string) that contains a list with all your assets and their respective fingerprints. This is used by the Rails helper methods to avoid handing the mapping requests back to Sprockets.

Now what is asset bridging in kamal? Here a [snippet from their docs](https://kamal-deploy.org/docs/configuration/asset-bridging/).

> If there are changes to CSS or JS files, we may get requests for the old versions on the new container and vice-versa. To avoid 404s we can specify an asset path. Kamal will replace that path in the container with a mapped volume containing both sets of files. This requires that file names change when the contents change (e.g. by including a hash of the contents in the name).

You can enable this behavior by specifying the `asset_path:` option in your deply.yml.

```yaml
# Again, this is the problem.
asset_path: /rails/public/assets
```

With this option set, kamal will keep both the current and the previous versions of the assets on your server. That means **there will be two** `.sprockets-manifest-randomhex.json` files. The Rails server **will choose the first one it finds!** It might be the new one, it might be the old one depending on where that random hex puts it on the file system.

The fix for now is to **turn off asset bridging**. The cost is low. It will only affect people who have in-flight requests right as the server restarts. They would just have to re-load the page again.

In the future, this could be fixed by only keeping one version of the manifest file, or specifiying which manifest to use somehow.

Thank you so much to reddit user [ignurant](https://www.reddit.com/user/ignurant/) for their detailed explanation in [this comment](https://www.reddit.com/r/ruby/comments/17jmert/comment/k72v7m2/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button).

## Update on April 25, 2024

There is another solution that allows you to still bridge the assets. You explicitly set the name of the manifest file in your `production.rb` file like this:

```rb
# config/environments/production.rb

config.assets.manifest = Rails.root.join('config', 'manifest.json')
```

This removes the random hash, allowing the new file to overwrite the old one on deploy. I don't know the reason for the random hash by default or the implications of removing it, but this would fix the problem outlined in this post. Thank you to you reddit user [\_skp](https://www.reddit.com/user/skp_/) for their help in this [comment](https://www.reddit.com/r/ruby/comments/1cbavse/comment/l14atcy/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button).
