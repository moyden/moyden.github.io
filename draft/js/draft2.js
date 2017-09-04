/* global d3, Vue */

d3.csv('data/standard.csv', function (standard) {
  standard.forEach((rank) => {
    if (rank.drafted === 'true') rank.drafted = true
    else rank.drafted = false

    if (rank.mine === 'true') rank.mine = true
    else rank.mine = false
  })
  const vm = new Vue({
    el: '#cont',

    data: {
      ranks: standard
    },

    computed: {
      highestAvailable: function () {
        return this.ranks.findIndex(function (player) {
          return player.drafted === false
        })
      }
    },

    methods: {
      addPlayer: function (player) {
        player.drafted = true
        player.mine = true
      },
      strikePlayer: function (player) {
        if (player.drafted) {
          player.drafted = false
          player.mine = false
        } else {
          player.drafted = true
        }
      }
    }
  })
})
