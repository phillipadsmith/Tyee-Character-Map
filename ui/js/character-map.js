---
---
window.App = {};
App.public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1OdhbHZ8jnGZ4lvUAfNrgGCZjpnWcaVuFhtJp3LR6qps/pubhtml';
App.storage = Tabletop.init( { key: App.public_spreadsheet_url, wait: true } );
App.Character = Backbone.Model.extend({
    idAttribute: 'name',
    defaults: {
        "image": "",
        "active": "" 
    },
    tabletop: {
        instance: App.storage,
        sheet: 'Sheet1'
    },
    sync: Backbone.tabletopSync,
    initialize: function(){
        this.checkImage();
    },
    checkImage: function() {
        var self = this;
        var name = self.get('name');
        var gender = self.get('gender');
        $.ajax({
            url:'{{ "/ui/img/" | prepend: site.baseurl }}' + name + '-small.png',
            type:'HEAD',
            error: function()
            {
                var person = App.characters.get(name);
                person.set('image','default-' + gender );
                //file not exists
            },
            success: function()
            {
                //file exists
                var person = App.characters.get(name);
                person.set('image', name );
            }
        });
    }
});
App.CharacterCollection = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: App.Character,
    tabletop: {
        instance: App.storage,
        sheet: 'Sheet1'
    },
    sync: Backbone.tabletopSync
});
App.CharacterView = Backbone.View.extend({
    tagname: 'div',
    template: _.template($('#person-template').html()),
    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    initialize: function() {
        this.listenTo(this.model, "change", this.render);
    },
});
App.CharactersView = Backbone.View.extend({
    tagname: 'div',
    template: _.template($('#people-template').html()),
    render: function() {
        $(this.el).html(this.template({ characters: this.collection.toJSON() }));
        return this;
    },
    events: {
        "mouseover .person-photo": "showCharacter",
        "click .person-photo": "showCharacter"
    },
    initialize: function() {
        this.listenTo(this.collection, "change", this.render);
    },
    showCharacter: function(event) {
        if ( App.ActivePerson ) {
            // Set the current person to inactive in the lineup
            App.ActivePerson.set('active','');
        }
        if ( event.currentTarget.dataset.person ) {
            var pid = event.currentTarget.dataset.person;
            var person = App.characters.get(pid);
            App.ActivePerson = person;
            person.set('active','active');
            if ( App.person_view ) {
                // Remove the current view before adding another
                App.person_view.remove();
            }
            App.person_view = new App.CharacterView({ model: person });
            $("#character-spotlight").append( App.person_view.render().el );
        }
    }
});
