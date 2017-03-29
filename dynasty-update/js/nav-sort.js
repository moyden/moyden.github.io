var $list = $('.site-nav__team-list'),
    $teams = $list.children('li');

$teams.sort(function(a, b) {
  if (+a.dataset.wins > +b.dataset.wins) return -1;
  else if (+a.dataset.wins < +b.dataset.wins) return 1;
  else if (+a.dataset.trophies > +b.dataset.trophies) return -1;
  else if (+a.dataset.trophies < +b.dataset.trophies) return 1;
  else return 0; 
});

$teams.detach().appendTo($list);
