/* globals expect, describe, it */
import Promise from 'bluebird'
import { mount } from 'enzyme'
import React from 'react'
import renderer from 'react-test-renderer'
import sinon from 'sinon'

import {
  Alert,
  Provider
} from '../../dist'

import JellyForm from '../../dist/unstable/components/JellyForm'

const schema = `
  title: Pokèmon
  version: 1
  properties:
    - Name:
        type: string
  additionalProperties: true
`

describe('JellyForm component', () => {
  it('should match the stored snapshot', () => {
    const value = {
      Name: 'Bulbasaur',
      foo: 'bar'
    }

    const component = renderer.create(
      <Provider>
        <JellyForm schema={schema} value={value} />
      </Provider>
    )
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should still render if an unknown format is used', () => {
    const uuidSchema = `
      title: UUID Schema
      properties:
        - id:
            type: string
            format: uuid
    `

    mount(
      <Provider>
        <JellyForm schema={uuidSchema} />
      </Provider>
    )
  })

  describe('hideSubmitButton property', () => {
    it('should render a submit button if the property is not specified', () => {
      const component = mount(
        <Provider>
          <JellyForm schema={schema} />
        </Provider>
      )

      expect(component.find('button')).toHaveLength(1)

      component.unmount()
    })

    it('should render a submit button if the property is falsey', () => {
      const component = mount(
        <Provider>
          <JellyForm schema={schema} hideSubmitButton={false} />
        </Provider>
      )

      expect(component.find('button')).toHaveLength(1)

      component.unmount()
    })

    it('should not render a submit button if the property is truthey', () => {
      const component = mount(
        <Provider>
          <JellyForm schema={schema} hideSubmitButton />
        </Provider>
      )

      expect(component.find('button')).toHaveLength(0)

      component.unmount()
    })
  })

  describe('submitButtonText property', () => {
    it('should change the text value of the submit button', () => {
      const submitText = 'Click me to submit this form'
      const component = mount(
        <Provider>
          <JellyForm schema={schema} submitButtonText={submitText} />
        </Provider>
      )

      expect(component.find('button').text()).toEqual(submitText)

      component.unmount()
    })

    it('should accept a JSX element as a value', () => {
      const submitText = 'Click me to submit this form'
      const submitElement = <span>{submitText}</span>

      const component = mount(
        <Provider>
          <JellyForm schema={schema} submitButtonText={submitElement} />
        </Provider>
      )

      expect(component.find('button').text()).toEqual(submitText)

      component.unmount()
    })
  })

  describe('submitButtonProps property', () => {
    it('should set submit button props', () => {
      const submitButtonProps = {
        className: 'custom-button-class'
      }

      const component = mount(
        <Provider>
          <JellyForm schema={schema} submitButtonProps={submitButtonProps} />
        </Provider>
      )

      expect(component.find('button').hasClass(submitButtonProps.className)).toEqual(true)

      component.unmount()
    })
  })

  describe('onFormSubmit property', () => {
    it('should be called when the submit button is clicked', () => {
      const value = 'Squirtle'
      const callback = sinon.spy()
      const component = mount(
        <Provider>
          <JellyForm schema={schema} onFormSubmit={callback} />
        </Provider>
      )

      const input = component.find('input')
      input.simulate('change', { target: { value } })
      component.update()

      component.find('form').simulate('submit')
      expect(callback.callCount).toEqual(1)
      expect(callback.getCall(0).args[0].formData).toEqual({ Name: value })

      component.unmount()
    })
  })

  describe('onFormChange property', () => {
    it('should be called when an input field is changed', () => {
      const value = 'Squirtle'
      const callback = sinon.spy()
      const component = mount(
        <Provider>
          <JellyForm schema={schema} onFormChange={callback} />
        </Provider>
      )

      const input = component.find('input')
      input.simulate('change', { target: { value } })
      component.update()

      return Promise.delay(150).then(() => {
        expect(callback.called).toEqual(true)
        expect(callback.lastCall.args[0].formData).toEqual({ Name: value })

        component.unmount()
      })
    })
  })

  describe('value property', () => {
    it('should set the value of the relevant input field', () => {
      const value = { Name: 'Squirtle' }
      const component = mount(
        <Provider>
          <JellyForm schema={schema} value={value} />
        </Provider>
      )

      const input = component.find('input')
      expect(input.props().value).toEqual('Squirtle')

      component.unmount()
    })

    it('should set the value if the value is changed after the component mounts', () => {
      const value = { Name: 'Squirtle' }
      const component = mount(
        React.createElement(
          props => (
            <Provider>
              <JellyForm {...props} />
            </Provider>
          ),
          { schema }
        )
      )

      component.setProps({ value })

      const input = component.find('input')
      expect(input.props().value).toEqual('Squirtle')

      component.unmount()
    })
  })

  describe('top-level array fields', () => {
    const schema = `
      type: array
      items:
        type: string
    `

    const callback = sinon.spy()

    it('should not crash on render', () => {
      mount(
        <Provider>
          <JellyForm
            schema={schema}
            onFormChange={callback}
          />
        </Provider>
      )
    })

    it('should not crash on add', () => {
      const component = mount(
        <Provider>
          <JellyForm
            schema={schema}
            onFormChange={callback}
          />
        </Provider>
      )
      const value = 'foobarbaz'

      component.find('.rendition-form-array-item__add-item')
        .first()
        .simulate('click')

      const input = component.find('input').first()

      input.simulate('change', {
        target: {
          value: value
        }
      })

      component.update()

      return Promise.delay(150).then(() => {
        const callArg = callback.lastCall.args[0]
        expect(callArg.formData).toEqual(
          [ value ]
        )
      })
    })
  })
  describe('array fields', () => {
    const arraySchema = `
      version: 1
      properties:
        - Array:
            type: array
            items:
              type: string
    `

    const callback = sinon.spy()
    const component = mount(
      <Provider>
        <JellyForm
          schema={arraySchema}
          onFormChange={callback}
        />
      </Provider>
    )

    const value1 = 'foobarbaz'
    const value2 = 'bazbarfoo'

    it('should be able to add an item', () => {
      const value = 'foobarbaz'

      component.find('.rendition-form-array-item__add-item')
        .first()
        .simulate('click')

      const input = component.find('input').first()

      input.simulate('change', {
        target: {
          value: value1
        }
      })

      component.update()

      return Promise.delay(150).then(() => {
        const callArg = callback.lastCall.args[0]
        expect(callArg.formData).toEqual({
          Array: [ value ]
        })
      })
    })

    it('should be able to add multiple items', () => {
      component.find('.rendition-form-array-item__add-item')
        .first()
        .simulate('click')

      const input = component.find('input').last()

      input.simulate('change', {
        target: {
          value: value2
        }
      })

      component.update()

      return Promise.delay(150).then(() => {
        const callArg = callback.lastCall.args[0]
        expect(callArg.formData).toEqual({
          Array: [ value1, value2 ]
        })
      })
    })

    it('should be able to move an item up', () => {
      component.find('.rendition-form-array-item__move-up')
        .last()
        .simulate('click')

      component.update()

      return Promise.delay(150).then(() => {
        const callArg = callback.lastCall.args[0]
        expect(callArg.formData).toEqual({
          Array: [ value2, value1 ]
        })
      })
    })

    it('should be able to move an item down', () => {
      component.find('.rendition-form-array-item__move-down')
        .first()
        .simulate('click')

      component.update()

      return Promise.delay(150).then(() => {
        const callArg = callback.lastCall.args[0]
        expect(callArg.formData).toEqual({
          Array: [ value1, value2 ]
        })
      })
    })

    it('should be able to remove an item', () => {
      component.find('.rendition-form-array-item__remove-item')
        .last()
        .simulate('click')

      component.update()

      return Promise.delay(150).then(() => {
        const callArg = callback.lastCall.args[0]
        expect(callArg.formData).toEqual({
          Array: [ value1 ]
        })

        component.unmount()
      })
    })
  })

  describe('uiSchema property', () => {
    it('should be able to add warnings using ui:warning', () => {
      const uiSchema = {
        Name: {
          'ui:warning': 'lorem ipsum dolor sit amet'
        }
      }

      const component = mount(
        <Provider>
          <JellyForm
            uiSchema={uiSchema}
            schema={schema}
          />
        </Provider>
      )

      const warnings = component.find(Alert)

      expect(warnings.length).toEqual(1)

      expect(warnings.first().text().trim()).toEqual(uiSchema.Name['ui:warning'])

      component.unmount()
    })
  })

  describe('field ids', () => {
    it('should generate a unique class name for each field', () => {
      const multiFieldSchema = `
        version: 1
        properties:
          - Name:
              title: Pokemon Name
              type: string
          - Height:
              type: number
          - Weight:
              type: number
          - Description:
              type: string
      `

      const component = mount(
        <Provider>
          <JellyForm
            schema={multiFieldSchema}
          />
        </Provider>
      )

      const expectedClassNames = multiFieldSchema.match(/- \w+:/g).map((result) => {
        const key = result.replace(/(-\s|:)/g, '')
        return `rendition-form__field--root_${key}`
      })

      expectedClassNames.forEach((className) => {
        expect(component.find(`.${className}`).hostNodes()).toHaveLength(1)
      })

      component.unmount()
    })
  })
})
