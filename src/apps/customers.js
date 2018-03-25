const template = `
<div class="container">
  <div class="row">
    <div class="col">
      <span>message: {{message}}</span>
    </div>
  </div>
</div>
`

kintone.events.on('app.record.detail.show', event => {
  const record = event.record

  const customSpace = kintone.app.record.getSpaceElement('customSpace')
  if (customSpace) {
    new Vue({
      el: '#' + customSpace.id,
      template: template,
      data: {
        record: record,
        message: 'Message'
      }
    })
  }

  return event
})
