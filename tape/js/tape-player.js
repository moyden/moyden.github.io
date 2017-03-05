(function () {

  // --- variables

  var animID;
  var tapeAudio = document.getElementById('tape-audio');
  var tapeLeft = d3.select('#tape--left'),
      tapeRight = d3.select('#tape--right'),
      reelLeft = d3.select('#reel--left'),
      reelRight = d3.select('#reel--right'),
      leadLeft = d3.select('#lead--left'),
      leadRight = d3.select('#lead--right'),
      progBar = d3.select('#progress--fill'),
      counter = d3.select('#time-counter');
  var x = d3.scaleLinear().range([0, 60]),
      r = d3.scalePow().exponent(1.4).range([42, 22]),
      theta = d3.scalePow().exponent(1.3),
      dScale = d3.scaleLinear().domain([0, 300])
        .range([250, 2000])
        .clamp(true),
      colour = d3.scaleOrdinal()
        .range([
          '#16a085',
          '#c0392b',
          '#2980b9',
          '#d35400',
          '#27ae60',
          '#8e44ad'
        ]);

  var songList = d3.select('.tape-player__song-list').selectAll('li')
      .data(audioTracks)
    .enter().append('li')
      .text(function(d) { return d.title ; })
      .attr('class', 'tape-player__song')
      .style('color', function(d, i) { return colour(i); })
      .on('click', function(d, i) {
        pauseAudio();
        loadSource(i);
      });

  loadSource(0);

  // --- controller functions

  function loadSource(index) {
    tapeAudio.src = audioTracks[index].src;
    stopAudio();
    d3.select('.tape-player__tape')
      .transition()
      .attr('stroke', colour(index));
    progBar.transition()
      .attr('fill', colour(index))
      .attr('width', 0);
    songList.style('border-bottom-style', function(d, i) {
      if (index == i) return 'solid';
      else return 'dashed';
    });
  }

  function playAudio() {
    cancelAnimationFrame(animID);
    animID = requestAnimationFrame(animateGraphics);
    tapeAudio.playbackRate = 1;
    tapeAudio.play();
  }

  function pauseAudio() {
    cancelAnimationFrame(animID);
    tapeAudio.pause();
  }

  function stopAudio() {
    pauseAudio();

    var dur = dScale(tapeAudio.currentTime);
    tapeAudio.currentTime = 0;
    updateCounter();

    progBar.transition()
        .duration(dur)
      .attr('width', 0);

    tapeLeft.transition()
        .duration(dur)
      .attr('r', r(0));

    tapeRight.transition()
        .duration(dur)
      .attr('r', r(1));

    reelLeft.transition()
        .duration(dur)
      .attr('transform',
      'translate(50, 50) rotate(' + theta(0) + ')');

    reelRight.transition()
        .duration(dur)
      .attr('transform',
      'translate(250, 50) rotate(' + (-theta(1)) + ')');

    t1 = tangent(50, 50, 46, 125, r(0), 'left');
    t2 = tangent(250, 50, 253, 120, r(1), 'right');

    leadLeft.transition()
        .duration(dur)
      .attr('x2', t1[0]).attr('y2', t1[1]);

    leadRight.transition()
        .duration(dur)
      .attr('x2', t2[0]).attr('y2', t2[1]);
  }

  function rewindAudio() {
    cancelAnimationFrame(animID);
    tapeAudio.pause();
    fastBackward();
  }

  function forwardAudio() {
    cancelAnimationFrame(animID);
    tapeAudio.pause();
    fastForward();
  }

  function fastForward() {
    tapeAudio.currentTime += 0.15;

    updateCounter();
    updateTape();

    animID = requestAnimationFrame(fastForward);
  }

  function fastBackward() {
    if (tapeAudio.currentTime < 0.15) stopAudio();
    else tapeAudio.currentTime -= 0.15;

    updateCounter();
    updateTape();

    animID = requestAnimationFrame(fastBackward);
  }

  function animateGraphics() {
    updateCounter();
    updateTape();

    animID = requestAnimationFrame(animateGraphics);
  }

  function updateCounter() {
    var elapsed = Math.floor(tapeAudio.currentTime),
        mins = Math.floor(elapsed/60),
        secs = elapsed%60,
        decs = "" + Math.floor(tapeAudio.currentTime*10);
    decs = decs.substring(decs.length - 1);
    counter.text(zeroPad(mins) + ":" + zeroPad(secs) + "." + decs);
  }

  function updateTape() {
    var p = tapeAudio.currentTime / tapeAudio.duration;
    progBar.attr('width', x(p));

    tapeLeft.attr('r', r(p));
    tapeRight.attr('r', r(1 - p));
    reelLeft.attr('transform',
      'translate(50, 50) rotate(' + theta(p) + ')');
    reelRight.attr('transform',
      'translate(250, 50) rotate(' + (-theta(1 - p)) + ')');

    t1 = tangent(50, 50, 46, 125, r(p), 'left');
    t2 = tangent(250, 50, 253, 120, r(1 - p), 'right');
    leadLeft.attr('x2', t1[0]).attr('y2', t1[1]);
    leadRight.attr('x2', t2[0]).attr('y2', t2[1]);
  }

  function setReelRotation() {
    theta.range([tapeAudio.duration*91, tapeAudio.duration]);
    reelLeft.transition()
      .attr('transform', 'translate(50, 50) rotate(' + theta(0) + ')');
    reelRight.transition()
      .attr('transform', 'translate(250, 50) rotate(' + (-theta(1)) + ')');
  }

  // --- event binding

  tapeAudio.addEventListener('loadedmetadata', function() {
    setReelRotation();
  })
  tapeAudio.addEventListener('ended', function() {
    stopAudio();
  })
  tapeAudio.addEventListener('timeupdate', function() {
    if (tapeAudio.playbackRate < 0) {
      if (tapeAudio.currentTime < 3) {
        stopAudio();
      }
    }
  })

  document.getElementById('tape-control-to-start')
    .addEventListener('click', function() { stopAudio(); });
  document.getElementById('tape-control-pause')
    .addEventListener('click', function() { pauseAudio(); });
  document.getElementById('tape-control-play')
    .addEventListener('click', function() { playAudio(); });
  document.getElementById('tape-control-rewind')
    .addEventListener('click', function() { rewindAudio(); });
  document.getElementById('tape-control-forward')
    .addEventListener('click', function() { forwardAudio(); });

  // --- helper functions

  // calculate tangent between circle at x1, y1 with radius r
  // and point at x2, y2. returns coordinates of point where
  // tangent touches circle
  function tangent(x1, y1, x2, y2, r, side) {
    var h = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1-y2, 2)),
        a1 = Math.asin(Math.abs(x1-x2)/h),
        a2 = Math.asin(r/h),
        a3 = a2 - a1,
        l1 = Math.sqrt(Math.pow(h, 2) - Math.pow(r, 2));
    if(side == 'left') var x3 = x2 - l1 * Math.sin(a3);
    else var x3 = x2 + l1 * Math.sin(a3);
    var y3 = y2 - l1 * Math.cos(a3);
    return [x3, y3];
  }

  // convert integer to two digit zero-padded string
  function zeroPad(num) {
    var add0 = "0" + num;
    return add0.substring(add0.length - 2);
  }

})();
