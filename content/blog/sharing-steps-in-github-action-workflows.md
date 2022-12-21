---
title: Sharing Steps in Github Action Workflows
date: 2022-06-13T13:00:00-07:00
draft: false
description: |
  I've got three workflow files all with slightly differing steps.
  Is there a way to share what is common? Yes.
---

I've got an [electron app](https://github.com/brimdata/brim) that needs to be built on all three platforms. I've got three workflow files all with slightly differing steps. Is there way to share whats common? Yes. It's called [composite actions](https://docs.github.com/en/actions/creating-actions/about-custom-actions#composite-actions).

## What is a Composite Action?

The name is not the most intuitive (why not "shared action"?), but it's a group of steps that are intended to be "used" within a workflow file. This is GitHub's solution for sharing steps between workflows. Here is an example of the simplest composite action. 

```yaml
name: "My Shared Steps"
runs:
  using: "composite" # <-- this is the important part
  steps:
    - run: echo "Hello, World"
      shell: bash
```

First, make a file like this and set the top-level `runs:` property to the string `"composite"`.  

Also, [Action](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#runs-for-composite-actions) files are different from [Workflow](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsrun) files. Once such difference is that your steps must specify a [shell](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsshell) property if they use `run:` . That knowledge will save you from this error.

![Shell Error](/img/sharing-steps-in-github-action-workflows/shell.png)



## Where do I put this file?

It can go anywhere in your repo. Or in it's own repo.  But, I want mine in the `.github/actions` folder at the root of my repository. Something like:

```
.github/actions/my-shared-steps/action.yml
```

Notice that I needed to create a directory containing a file called `action.yml`. This is the required structure for an action. I tried naming the file something else and it didn't like that. 

![Action Error](/img/sharing-steps-in-github-action-workflows/action.png)

> Important: the action must be a directory containing an action.yml file.



## How do I use it?

If you read that error above closely, you noticed an important catch. Before I could use this action, I had to first checkout the repo. That makes sense, since the file is...well...in the repo. Here's how the steps of my workflow job look:

```yaml
steps:
	- uses: actions/checkout@v3 # required first
	- uses: ./.github/actions/my-shared-steps
```

Since I am using an [action that is in our repo](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-using-an-action-in-the-same-repository-as-the-workflow), I specify the path to the file from the root of the repository starting with a `./` (that's required).  If your action is not in the repo, [here are your options](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsuses) for using it.

## Passing Data to the Action

More errors revealed that I couldn't use the `${{ secrets }}` variable in my composite action. I had to pass it data using the `inputs:` property in the action, and the `with:` property in the workflow. Here's an example:



```yaml
# .github/actions/build-win/action.yml

name: Build Windows
description: Specific steps to build for Windows
inputs:
  csc_key_password:
    required: true
  csc_link:
    required: true
  gh_token:
    required: true
runs:
  using: "composite"
  steps:
    - name: Build Signed Release
      shell: bash
      run: yarn electron-builder --win
      env:
        CSC_KEY_PASSWORD: ${{ inputs.csc_key_password }}
        CSC_LINK: ${{ inputs.csc_link }}
        GH_TOKEN: ${{ inputs.gh_token }}
```

And I used it like this:

```yaml
# .github/workflows/win-release-candidate.yml

name: Brim Windows release candidate creation
on:
  pull_request:
jobs:
  build:
    runs-on: windows-2019
    steps:
      - uses: actions/checkout@v2
      - uses: ./.github/actions/setup-brim
      - uses: ./.github/actions/build-win # <--- Using the composite action here
        with:
          csc_key_password: ${{ secrets.WINDOWS_SIGNING_PASSPHRASE }}
          csc_link: ${{ secrets.WINDOWS_SIGNING_PFX_BASE64 }}
          gh_token: ${{ secrets.GITHUB_TOKEN }}
```



## Can I publish it?

Yes. This article in the docs titled "[Creating a composite action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)" shows how to make a compsite action in it's own repo with inputs and outputs, then uses it in a workflow.

I've now DRY'd out my CI workflows with composite actions. One installs Go and Node then runs yarn install. Another publishes artifacts to our private Google Cloud bucket. It's great.

_Post Script_

Debugging CI is a pain. You know. You edit a workflow file, you commit, you push, you open the browser, you wait, it fails, your YAML was not indented enough, repeat. It sucks. There has got to be a better way. To start, it would be great to at least validate my workflow file with some CLI tool before I push. Or a local VM I could test it in? If this exists already, someone please tell me.
