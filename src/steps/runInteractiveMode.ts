import fs from 'node:fs'
import { join } from 'node:path'
import { red, reset } from 'kolorist'
import prompts from 'prompts'
import { CWD, DEFAULT_TARGET_DIR, FRAMEWORKS, TEMPLATES } from '../helpers/constants'
import { formatTargetDir } from '../helpers/formatTargetDir'
import { isEmpty } from '../helpers/isEmpty'
import { isValidPackageName } from '../helpers/isValidPackageName'
import { getProjectName } from '../helpers/getProjectName'
import { toValidPackageName } from '../helpers/toValidPackageName'
import type { Framework, Variant } from '../types'
import { isValidSampleName } from '../helpers/isValidSampleName'

type Answers = prompts.Answers<'projectName' | 'overwrite' | 'packageName' | 'framework' | 'variant' | 'sample' | 'targetDir' >
export default async function runInteractiveMode(
  argTargetDir: string | undefined,
  argTemplate: string | undefined,
  argSample: string | undefined,
  overwrite: boolean,
) {
  let targetDir = argTargetDir || DEFAULT_TARGET_DIR

  prompts.override({
    overwrite,
  })

  const result: Answers = await prompts(
    [
      {
        type: argTargetDir ? null : 'text',
        name: 'projectName',
        message: reset('Project name:'),
        initial: DEFAULT_TARGET_DIR,
        onState: (state) => {
          targetDir = formatTargetDir(state.value) || DEFAULT_TARGET_DIR
        },
      },
      {
        type: null,
        name: 'targetDir',
      },
      {
        type: () => !fs.existsSync(join(CWD, targetDir)) || isEmpty(join(CWD, targetDir)) ? null : 'select',
        name: 'overwrite',
        message: () =>
            `${targetDir === '.'
              ? 'Current directory'
              : `Target directory "${targetDir}"`
            } is not empty. Please choose how to proceed:`,
        initial: 0,
        choices: [
          {
            title: 'Remove existing files and continue',
            value: 'yes',
          },
          {
            title: 'Cancel operation',
            value: 'no',
          },
          {
            title: 'Ignore files and continue',
            value: 'ignore',
          },
        ],
      },
      {
        type: (_, { overwrite }: { overwrite?: string }) => {
          if (overwrite === 'no')
            throw new Error(`${red('✖')} Operation cancelled`)

          return null
        },
        name: 'overwriteChecker',
      },
      {
        type: () => (isValidPackageName(getProjectName(targetDir)) ? null : 'text'),
        name: 'packageName',
        message: reset('Package name:'),
        initial: () => toValidPackageName(getProjectName(targetDir)),
        validate: dir =>
          isValidPackageName(dir) || 'Invalid package.json name',
      },
      {
        type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : 'select',
        name: 'framework',
        message:
            typeof argTemplate === 'string' && !TEMPLATES.includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `,
              )
              : reset('Select a framework:'),
        initial: 0,
        choices: FRAMEWORKS.map((framework) => {
          const frameworkColor = framework.color
          return {
            title: frameworkColor(framework.display || framework.name),
            value: framework,
          }
        }),
      },
      {
        type: (framework: Framework) =>
          framework && framework.variants ? 'select' : null,
        name: 'variant',
        message: reset('Select a variant:'),
        choices: (framework: Framework) => {
          return framework.variants.map((variant) => {
            const variantColor = variant.color
            return {
              title: variantColor(variant.display || variant.name),
              value: variant,
            }
          })
        },
      },
      {
        type: (variant: Variant) =>
          variant && isValidSampleName(variant, argSample) ? null : 'select',
        name: 'sample',
        message: (variant: Variant) => {
          return typeof argSample === 'string' && !isValidSampleName(variant, argSample)
            ? reset(
                `"${argSample}" isn't a valid sample. Please choose from below: `,
            )
            : reset('Select a sample:')
        },
        choices: (variant: Variant) => {
          return variant.samples.map((sample) => {
            const sampleColor = sample.color
            return {
              title: sampleColor(sample.display || sample.name),
              value: sample.name,
            }
          })
        },
      },
    ],
    {
      onCancel: () => {
        throw new Error(`${red('✖')} Operation cancelled`)
      },
    },
  )
  result.targetDir = targetDir
  return result
}