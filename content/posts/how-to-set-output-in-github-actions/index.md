---
title: "How to Set Output Values in Github Actions"
date: 2024-04-22T14:15:10-07:00
draft: false
tags: ["ci", "github"]
---

This is the syntax for setting an output parameter in a Github Actions step.

```bash
echo "{name}={value}" >> "$GITHUB_OUTPUT"
```

Here's an example of using this syntax in a workflow step.

```yaml
- name: Expose the artifact path
  id: paths
  run: echo "artifact='app-setup.exe'" >> "$GITHUB_OUTPUT"
```

Here's an example of using the output of a command as the value.

```yaml
run: echo "artifact='$(yarn run artifact-path)'" >> "$GITHUB_OUTPUT"
```

And here is how you would access that output value in a later step.

```yaml
- name: Later Step
  run: ./bin/codesign ${{ steps.paths.outputs.artifact }}
```

The syntax is `steps.[step_id].outputs.[output_name]`.

It took me several attempts to discover this snippet on the Github Actions docs, so I decided to [post it here](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter).

Happy hacking.
