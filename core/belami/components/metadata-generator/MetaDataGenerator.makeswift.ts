import { TextArea } from '@makeswift/runtime/controls';
import { lazy } from 'react';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(
    lazy(() => import('./MetaDataGenerator').then((module) => ({ default: module.MetaDataGenerator }))),
    {
        type: 'meta-data',
        label: 'Meta Data / Generator',
        props: {
            code: TextArea({ label: "Code",  }),
        }
    }
)
