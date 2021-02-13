/*!
 * @cdp/extension-template-transformer 0.9.5
 *   Generated by 'cdp-task bundle dts' task.
 *   - built with TypeScript 4.1.5
 */
import { Part, SVGTemplateResult, TemplateResult } from '@cdp/extension-template';

export type TemplateTag = (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult | SVGTemplateResult;
export type UnsafeHTMLDirective = (value: unknown) => (part: Part) => void;
export type TemplateTransformer = (mustache: string) => (view?: Record<string, unknown>) => TemplateResult | SVGTemplateResult;
export type TransformTester = (input: string, config: TransformConfig) => boolean;
export type TransformExecutor = (input: string, config: TransformConfig) => TemplateResult | SVGTemplateResult | undefined;
export type TransformeContext = {
    test: TransformTester;
    transform: TransformExecutor;
};
export interface TransformConfig {
    html: TemplateTag;
    transformVariable: TransformExecutor;
    delimiter?: {
        start: string;
        end: string;
    };
    transformers?: Record<string, TransformeContext>;
}
export declare function createTransformFactory(html: TemplateTag, unsafeHTML: UnsafeHTMLDirective): TemplateTransformer;
export declare function createTransformFactory(config: TransformConfig): TemplateTransformer;
export declare const transformer: {
    variable: TransformExecutor;
    unsafeVariable: (unsafeHTML: UnsafeHTMLDirective) => TransformeContext;
    section: () => TransformeContext;
    invertedSection: () => TransformeContext;
    comment: () => TransformeContext;
    customDelimiter: () => TransformeContext;
};
