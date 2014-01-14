module EasyApiDoc
  class Parameter
    include EasyApiDoc::Configurable

    attr_accessor :field_name

    def initialize(*params)
      super(*params)
      set_field_name
    end

    def nested?
      self['type'] == nil
    end

    def contains_list?
      @attributes[@attributes.keys.first].is_a? Hash and !@attributes[@attributes.keys.first]['type']
    end

    def parameters
      return @parameters if @parameters
      field_namespace = @field_namespace || []
      field_namespace << @name
      @parameters = load_children(EasyApiDoc::Parameter, nil, {:extra_attributes => {'field_namespace' => field_namespace}, :exclude => ['field_namespace']})
      @parameters.each { |p|
        p.set_namespace(field_namespace)
      }
    end

    def scope_level
      (@field_namespace || []).size
    end

    def set_namespace(base_namespace = [])
      @field_namespace = base_namespace + (@field_namespace || [])
    end

    private

    # Field namespace is for managing nested parameters so that the form we output will have an input labeled correctly in our executable harness
    # :user => {:email}
    # will produce: 'user[email]' as the @field_name
    # name: the name/label of this parameter (email in our example)
    # namespaces, an array of the scopes to prepend
    def set_field_name
      field_namespace = @attributes['field_namespace']
      fname = if field_namespace
        field_namespace.map do |n|
          n == field_namespace.first ? n : "[#{n}]"
        end.join + "[#{@name}]"
      else
        @name
      end
      fname += '[]' if contains_list?
      @field_name = fname
    end
  end
end
