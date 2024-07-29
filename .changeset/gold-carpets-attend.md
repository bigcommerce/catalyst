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
    aria-label={t('ariaLabel')}
    onValueChange={onSort}
    value={value}
>
    <SelectContent>
        <SelectItem value="featured">{t('featuredItems')}</SelectItem>
        <SelectItem value="newest">{t('newestItems')}</SelectItem>
        <SelectItem value="best_selling">{t('bestSellingItems')}</SelectItem>
        <SelectItem value="a_to_z">{t('aToZ')}</SelectItem>
        <SelectItem value="z_to_a">{t('zToA')}</SelectItem>
        <SelectItem value="best_reviewed">{t('byReview')}</SelectItem>
        <SelectItem value="lowest_price">{t('priceAscending')}</SelectItem>
        <SelectItem value="highest_price">{t('priceDescending')}</SelectItem>
        <SelectItem value="relevance">{t('relevance')}</SelectItem>
    </SelectContent>
</Select>
```

After refactor:

```
<Select
    aria-label={t('ariaLabel')}
    onValueChange={onSort}
    options={[
        { value: 'featured', label: t('featuredItems') },
        { value: 'newest', label: t('newestItems') },
        { value: 'best_selling', label: t('bestSellingItems') },
        { value: 'a_to_z', label: t('aToZ') },
        { value: 'z_to_a', label: t('zToA') },
        { value: 'best_reviewed', label: t('byReview') },
        { value: 'lowest_price', label: t('priceAscending') },
        { value: 'highest_price', label: t('priceDescending') },
        { value: 'relevance', label: t('relevance') },
    ]}
    value={value}
/>
```