# 0.2.46

Adds a filter-for-export filter:

This formatter walks through the content tree.

At each node it checks if the node implements a method `filterForExport`

If so, the method is called.

In this way, custom elements can filter out their contents from export.

So if an editor includes an element: `<custom-element></custom-element>`,

And the custom element sets some content such that inner html looks like:

`<custom-element>Content For Display</custom-element>`

The prototype for `<custom-element>` may implement `filterForExport` thusly:

```
CustomElement.prototype.filterForExport = function () {
  this.innerHTML == '';
  }
```

And the exported html will look like this:

`<custom-element></custom-element>`

In this way a custom element my render demonstrative content inside the editor,
but not have that content saved to our database.

