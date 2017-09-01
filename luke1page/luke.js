/* global Vue */

const vm = new Vue({
  el: '#container',

  data: {
    current: {
      name: 'Jammz & Dread D – 10 Missed Calls',
      source: 'https://player.vimeo.com/video/195300742'
    },
    catalog: [
      {
        name: 'Jammz & Dread D – 10 Missed Calls',
        source: 'https://player.vimeo.com/video/195300742',
        active: true
      },
      {
        name: 'Blue Daisy – Gravediggers',
        source: 'https://player.vimeo.com/video/195291330',
        active: false
      },
      {
        name: 'tqd – A Letter to EZ',
        source: 'https://player.vimeo.com/video/209229243',
        active: false
      },
      {
        name: '67 – The Glorious Twelfth',
        source: 'https://player.vimeo.com/video/225487859',
        active: false
      },
      {
        name: 'He Works The Long Nights',
        source: 'https://player.vimeo.com/video/195297258',
        active: false
      }
    ]
  },

  methods: {
    loadVideo: function (film) {
      this.current.name = film.name
      this.current.source = film.source
      this.catalog.forEach(function (item) {
        item.active = false
      })
      film.active = true
    }
  }
})
