Collapser =
  initialise_collapsable_panels : (current_selection) ->
    $panels = $('.panel-collapse-container')
    $panels.addClass('closed')
    $heading_links = $('.panel-collapse-heading a')
    $heading_links.each ->
      if $(this).closest('.panel').find('.panel-collapse').hasClass('in')
        $(this).prepend('<i class="ico-collapse ico ico-fw ico-chevron-down"></i>')
      else
        $(this).prepend('<i class="ico-collapse ico ico-fw ico-chevron-up"></i>')

    $('.collapse').collapse()
    $('.panel').on # bootstrap collapse events!
      'show.bs.collapse': ->
        $panel = $(this).closest('.panel-collapse-container')
        $panel.removeClass('closed')
        $panel.addClass('opened')
        $panel.find('.panel-collapse-heading a i').removeClass('ico-chevron-down').addClass('ico-chevron-up')
      'hide.bs.collapse': ->
        $panel = $(this).closest('.panel-collapse-container')
        $panel.removeClass('opened')
        $panel.addClass('closed')
        $panel.find('.panel-collapse-heading a i').removeClass('ico-chevron-up').addClass('ico-chevron-down')

$(document).ready ->
  Collapser.initialise_collapsable_panels()
