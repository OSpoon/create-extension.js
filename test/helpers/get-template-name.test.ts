import { describe, expect, it } from 'vitest'
import { getTemplateName } from '../../src/helpers/getTemplateName'

describe('helpers', () => {
  it('set a valid template name: ', () => {
    const result = getTemplateName('vue-devtools-tailwind')
    expect(result).toMatchInlineSnapshot(`"vue-devtools-tailwind"`)
  })

  it('set a valid composite template name: ', () => {
    const result = getTemplateName('tailwind,devtools,vue')
    expect(result).toMatchInlineSnapshot(`"vue-devtools-tailwind"`)
  })

  it('set an invalid template name: ', () => {
    const result = getTemplateName('vue-typescript')
    expect(result).toMatchInlineSnapshot(`undefined`)
  })

  it('set an invalid composite template name: ', () => {
    const result = getTemplateName('vue,typescript,tailwind')
    expect(result).toMatchInlineSnapshot(`undefined`)
  })

  it('set an empty string as the template name: ', () => {
    const result = getTemplateName('')
    expect(result).toMatchInlineSnapshot(`undefined`)
  })

  it('set undefined to the template name: ', () => {
    const result = getTemplateName(undefined as unknown as string)
    expect(result).toMatchInlineSnapshot(`undefined`)
  })
})
