$.extend
  initialise_collapsable_panels: () ->
    $panels = $('.collapse').closest('.panel')
    $panels.addClass('closed')
    $heading_links = $panels.find('.panel-heading a')
    $heading_links.each ->
      if $(this).closest('.panel').find('.panel-collapse').hasClass('in')
        $(this).prepend('<i class="ico-collapse ico ico-fw ico-chevron-down"></i>')
      else
        $(this).prepend('<i class="ico-collapse ico ico-fw ico-chevron-up"></i>')

    $('.collapse').collapse()
    $('.panel').on # bootstrap collapse events!
      'show.bs.collapse': ->
        $panel = $(this).closest('.panel')
        $panel.removeClass('closed')
        $panel.addClass('opened')
        $panel.find('.panel-heading a i').removeClass('ico-chevron-down').addClass('ico-chevron-up')
      'hide.bs.collapse': ->
        $panel = $(this).closest('.panel')
        $panel.removeClass('opened')
        $panel.addClass('closed')
        $panel.find('.panel-heading a i').removeClass('ico-chevron-up').addClass('ico-chevron-down')

$(document).ready ->
  $.initialise_collapsable_panels()
