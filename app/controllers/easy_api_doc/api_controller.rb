module EasyApiDoc
  class ApiController < EasyApiDoc::ApplicationController
    before_filter :defaults

    def index
      @api_versions = EasyApiDoc::ApiVersion.all
    end

    def show
      @api_version = EasyApiDoc::ApiVersion.find(params[:id])
    end

    private

    def defaults
      @meta = EasyApiDoc::ApiVersion.config['meta']
    end

  end
end
