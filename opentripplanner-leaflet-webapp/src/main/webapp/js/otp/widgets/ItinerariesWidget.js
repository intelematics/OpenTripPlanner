/* This program is free software: you can redistribute it and/or
   modify it under the terms of the GNU Lesser General Public License
   as published by the Free Software Foundation, either version 3 of
   the License, or (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>. 
*/

otp.namespace("otp.widgets");

otp.widgets.ItinerariesWidget = 
    otp.Class(otp.widgets.Widget, {

    module : null,
    
    header : null,
    itinsAccord : null,
    footer : null,
    
    itineraries : null,
    activeIndex : 0,
    
    // set to true by next/previous/etc. to indicate to only refresh the currently active itinerary
    refreshActiveOnly : false,
    
    initialize : function(id, module) {
    
        otp.widgets.Widget.prototype.initialize.apply(this, arguments);
        this.module = module;
        this.$().addClass('otp-itinsWidget');
        this.$().resizable();
        this.header = $("<div>X Itineraries Returned:</div>").appendTo(this.$());
    },
    
    updateItineraries : function(itins) {
        var this_ = this;
        var divId = this.id+"-itinsAccord";
        
        if(this.refreshActiveOnly == true) {
            this.itineraries[this.activeIndex] = itins[0];
            var itinHeader = $('#'+divId+'-headerContent-'+this.activeIndex);
            itinHeader.html(this.headerContent(itins[0], this.activeIndex));
            var itinContainer = $('#'+divId+'-'+this.activeIndex);
            itinContainer.empty();
            this.renderItinerary(itins[0], this.activeIndex).appendTo(itinContainer);
            this.refreshActiveOnly = false;
            return;
        }            
        this.itineraries = itins;
        this.header.html(itins.length+" Itineraries Returned:");
        
        if(this.itinsAccord !== null) {
            this.itinsAccord.remove();
        }
        if(this.footer !== null) {
            this.footer.remove();
        }
        var html = "<div id='"+divId+"' class='otp-itinsAccord'></div>";
        this.itinsAccord = $(html).appendTo(this.$());
        this.appendFooter();

        for(var i=0; i<itins.length; i++) {
            var itin = itins[i];
            //$('<h3><span id='+divId+'-headerContent-'+i+'>'+this.headerContent(itin, i)+'<span></h3>').appendTo(this.itinsAccord).click(function(evt) {
            //$('<h3>'+this.headerContent(itin, i)+'</h3>').appendTo(this.itinsAccord).click(function(evt) {
            $('<h3><div id='+divId+'-headerContent-'+i+'>'+this.headerContent(itin, i)+'</div></h3>').appendTo(this.itinsAccord).click(function(evt) {
                console.log(evt.target);
                var arr = evt.target.id.split('-');
                var index = parseInt(arr[arr.length-1]);
                this_.module.drawItinerary(itins[index]);
                this_.activeIndex = index;
            });
            $('<div id="'+divId+'-'+i+'"></div>').appendTo(this.itinsAccord).append(this.renderItinerary(itin, i));
        }
        this.activeIndex = 0;
        
        this.itinsAccord.accordion({
            heightStyle: "fill"
        });
        
        this.$().resize(function(){
            this_.itinsAccord.accordion("resize");
        });

        this.$().draggable({ cancel: "#"+divId });
        
    },
    
    appendFooter : function() {
        var this_ = this;
        this.footer = $("<div class='otp-itinsButtonRow'></div>").appendTo(this.$());
        $('<button>First</button>').button().appendTo(this.footer).click(function() {
            var params = this_.module.lastQueryParams;
            var stopId = otp.util.Itin.getFirstStop(this_.itineraries[this_.activeIndex]);
            _.extend(params, { startTransitStopId :  stopId, time : "04:00am", arriveBy : false });
            this_.refreshActiveOnly = true;
            this_.module.planTrip(params);
        });
        $('<button>Previous</button>').button().appendTo(this.footer).click(function() {
            var endTime = this_.itineraries[this_.activeIndex].endTime;
            var params = this_.module.lastQueryParams;
            var newEndTime = this_.itineraries[this_.activeIndex].endTime - 90000;
            var stopId = otp.util.Itin.getFirstStop(this_.itineraries[this_.activeIndex]);
            _.extend(params, { startTransitStopId :  stopId, time : otp.util.Time.formatItinTime(newEndTime, "h:mma"), date : otp.util.Time.formatItinTime(newEndTime, "MM-DD-YYYY"), arriveBy : true });
            this_.refreshActiveOnly = true;
            this_.module.planTrip(params);            
        });
        $('<button>Next</button>').button().appendTo(this.footer).click(function() {
            var endTime = this_.itineraries[this_.activeIndex].endTime;
            var params = this_.module.lastQueryParams;
            var newStartTime = this_.itineraries[this_.activeIndex].startTime + 90000;
            var stopId = otp.util.Itin.getFirstStop(this_.itineraries[this_.activeIndex]);
            _.extend(params, { startTransitStopId :  stopId, time : otp.util.Time.formatItinTime(newStartTime, "h:mma"), date : otp.util.Time.formatItinTime(newStartTime, "MM-DD-YYYY"), arriveBy : false });
            this_.refreshActiveOnly = true;
            this_.module.planTrip(params);      
        });
        $('<button>Last</button>').button().appendTo(this.footer).click(function() {
            var params = this_.module.lastQueryParams;
            var stopId = otp.util.Itin.getFirstStop(this_.itineraries[this_.activeIndex]);
            _.extend(params, { startTransitStopId :  stopId, date : moment().add('days', 1).format("MM-DD-YYYY"), time : "04:00am", arriveBy : true });
            this_.refreshActiveOnly = true;
            this_.module.planTrip(params);
        });
    },
    
    // returns HTML text
    headerContent : function(itin, index) {
        // show number of this itinerary (e.g. "1.")
        var html= '<div class="otp-itinsAccord-header-number">'+(index+1)+'.</div>';
        
        // show iconographic trip leg summary  
        html += '<div class="otp-itinsAccord-header-icons">'+otp.util.Itin.getIconSummaryHTML(itin)+'</div>';
        
        // show trip duration
        html += '<div class="otp-itinsAccord-header-duration">('+otp.util.Time.msToHrMin(itin.duration)+')</div>';
        
        // clear div
        html += '<div style="clear:both;"></div>';
        return html;
    },
    
    // returns jQuery object
    renderItinerary : function(itin, i) {
        var this_ = this;

        // render legs
        var divId = this.moduleId+"-itinAccord-"+i;
        var accordHtml = "<div id='"+divId+"' class='otp-itinAccord'></div>";
        var itinAccord = $(accordHtml);
        for(var l=0; l<itin.legs.length; l++) {
            var leg = itin.legs[l];
            var headerHtml = "<b>"+leg.mode+"</b>";
            if(leg.mode === "WALK" || leg.mode === "BICYCLE") headerHtml += " to "+leg.to.name;
            else if(leg.agencyId !== null) headerHtml += ": "+leg.agencyId+", ("+leg.route+") "+leg.routeLongName;
            $("<h3>"+headerHtml+"</h3>").appendTo(itinAccord).hover(function(evt) {
                var arr = evt.target.id.split('-');
                var index = parseInt(arr[arr.length-1]);
                this_.module.highlightLeg(itin.legs[index]);
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawStartBubble(itin.legs[index], true);
                this_.module.drawEndBubble(itin.legs[index], true);
            }, function(evt) {
                this_.module.clearHighlights();
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawAllStartBubbles(itin);
            });
            this_.renderLeg(leg, (l>0 ? itin.legs[l-1] : null)).appendTo(itinAccord);
        }
        itinAccord.accordion({
            active: false,
            heightStyle: "content",
            collapsible: true
        });

        var itinDiv = $("<div></div>");

        // add start and end time rows        
        itinDiv.append("<div class='otp-itinStartRow'><b>Start</b>: "+otp.util.Time.formatItinTime(itin.startTime)+"</div>");
        itinDiv.append(itinAccord);
        itinDiv.append("<div class='otp-itinEndRow'><b>End</b>: "+otp.util.Time.formatItinTime(itin.endTime)+"</div>");

        // TODO: add trip summary
        
        return itinDiv;
    },
    
    renderLeg : function(leg, previousLeg) {
        var this_ = this;
        if(otp.util.Itin.isTransit(leg.mode)) {
            var legDiv = $('<div></div>');
            
            $('<div class="otp-itin-leg-leftcol">'+otp.util.Time.formatItinTime(leg.startTime, "h:mma")+"</div>").appendTo(legDiv);

            $('<div class="otp-itin-leg-endpointDesc"><b>Board</b> at '+leg.from.name+'</div>')
            .appendTo(legDiv)
            .click(function(evt) {
                this_.module.webapp.map.lmap.panTo(new L.LatLng(leg.from.lat, leg.from.lon));
            }).hover(function(evt) {
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawStartBubble(leg, true);            
            }, function(evt) {
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawAllStartBubbles(this_.itineraries[this_.activeIndex]);
            });

            $('<div class="otp-itin-leg-elapsedDesc">Time in transit: '+otp.util.Time.msToHrMin(leg.duration)+'</div>').appendTo(legDiv);

            $('<div class="otp-itin-leg-leftcol">'+otp.util.Time.formatItinTime(leg.endTime, "h:mma")+"</div>").appendTo(legDiv);

            $('<div class="otp-itin-leg-endpointDesc"><b>Alight</b> at '+leg.to.name+'</div>')
            .appendTo(legDiv)
            .click(function(evt) {
                this_.module.webapp.map.lmap.panTo(new L.LatLng(leg.to.lat, leg.to.lon));
            }).hover(function(evt) {
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawEndBubble(leg, true);            
            }, function(evt) {
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawAllStartBubbles(this_.itineraries[this_.activeIndex]);
            });
            
            return legDiv;

            /*if(previousLeg) {
                html += '<div class="otp-itin-leg-leftcol">'+otp.util.Time.formatItinTime(previousLeg.endTime, "h:mma")+"</div>";
                html += '<div class="otp-itin-leg-endpointDesc">Arrive at '+leg.from.name+'</div>';
                html += '<div class="otp-itin-leg-elapsedDesc">Wait time: '+otp.util.Time.msToHrMin(leg.startTime-previousLeg.endTime)+'</div>';
            }*/
        }
        else { // walk / bike / car
            var legDiv = $('<div></div>');
            
            for(var i=0; i<leg.steps.length; i++) {
                var step = leg.steps[i];
                var text = otp.util.Itin.getLegStepText(step);
                
                var html = '<div id="foo-'+i+'" class="otp-itin-step-row">';
                html += '<div class="otp-itin-step-icon">';
                if(step.relativeDirection)
                    html += '<img src="images/directions/' +
                        step.relativeDirection.toLowerCase()+'.png">';
                html += '</div>';                
                var distArr= otp.util.Itin.distanceString(step.distance).split(" ");
                html += '<div class="otp-itin-step-dist">' +
                    '<span style="font-weight:bold; font-size: 1.2em;">' + 
                    distArr[0]+'</span><br>'+distArr[1]+'</div>';
                html += '<div class="otp-itin-step-text">'+text+'</div>';
                html += '<div style="clear:both;"></div></div>';

                $(html).appendTo(legDiv)
                .data("step", step)
                .data("stepText", text)
                .click(function(evt) {
                    var step = $(this).data("step");
                    this_.module.webapp.map.lmap.panTo(new L.LatLng(step.lat, step.lon));
                }).hover(function(evt) {
                    var step = $(this).data("step");
                    $(this).css('background', '#f0f0f0');
                    var popup = L.popup()
                        .setLatLng(new L.LatLng(step.lat, step.lon))
                        .setContent($(this).data("stepText"))
                        .openOn(this_.module.webapp.map.lmap);
                }, function(evt) {
                    $(this).css('background', '#e8e8e8');
                    this_.module.webapp.map.lmap.closePopup();
                });
            }
            return legDiv;                        
        }
        return $("<div>Leg details go here</div>");
    }
    
});

    
