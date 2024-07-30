---
"@bigcommerce/catalyst-core": minor 
---

This refactor changes the structure of our UI components by replacing composability with a prop-based configuration. This change simplifies the use of our components, eliminating the need to build them individually from a composable approach. Additionally, it provides a single location for all class customizations, improving the experience when fully customizing the component. We believe this approach will make it easier to use components correctly and safeguard against incorrect usage. Ultimately, by adopting a prop-based configuration, we aim to achieve full replaceability and simplify theming for our components.

Before refactor:

```
<Accordions>
    <AccordionsItem>
        <AccordionsTrigger>
            Title 1
        </AccordionsTrigger>
        <AccordionsContent>
            Item Content 1
        </AccordionsContent>
    </AccordionsItem>
    <AccordionsItem>
        <AccordionsTrigger>
            Title 2
        </AccordionsTrigger>
        <AccordionsContent>
            Item Content 2
        </AccordionsContent>
    </AccordionsItem>
</Accordions>
```

After refactor:

```
<Accordions accordions={[
    {value: 'Title 1', content: 'Item Content 1'},
    {value: 'Title 2', content: 'Item Content 2'}
]}>
```

Before refactor:

```
<Select
    onValueChange={onSort}
    value={value}
>
    <SelectContent>
        <SelectItem value="featured">Featured</SelectItem>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="best_selling">Best selling</SelectItem>
        <SelectItem value="a_to_z">A to Z</SelectItem>
        <SelectItem value="z_to_a">Z to A</SelectItem>
        <SelectItem value="best_reviewed">By reviews</SelectItem>
        <SelectItem value="lowest_price">Price ascending</SelectItem>
        <SelectItem value="highest_price">Price descending</SelectItem>
        <SelectItem value="relevance">Relevance</SelectItem>
    </SelectContent>
</Select>
```

After refactor:

```
<Select
    onValueChange={onSort}
    options={[
        { value: 'featured', label: 'Featured' },
        { value: 'newest', label: 'Newest' },
        { value: 'best_selling', label: 'Best selling' },
        { value: 'a_to_z', label: 'A to Z' },
        { value: 'z_to_a', label: 'Z to A' },
        { value: 'best_reviewed', label: 'By reviews'},
        { value: 'lowest_price', label: 'Price ascending' },
        { value: 'highest_price', label: 'Price descending' },
        { value: 'relevance', label: 'Relevance' },
    ]}
    value={value}
/>
```