ig.module('plugins.ai').
    defines(function(){
        ig.ai = ig.Class.extend({
            init: function(entity){
                ig.ai.ACTION 		= { Rest:0,MoveLeft:1,MoveRight:2,MoveUp:3,MoveDown:4,Attack:5,Block:6 };
                this.entity  = entity;
            },
            doAction: function(action){
                this.lastAction = action;
                return action;
            },
            //tell the caller what his best action is
            getAction: function(entity){
                this.entity = entity;
                //by default do nothing
                var playerList 	  = ig.game.getEntitiesByType('EntityPlayer');
                var player        = playerList[0];
                var distance      = this.entity.distanceTo(player);
                var angle         = this.entity.angleTo(player);
                var x_dist        = distance * Math.cos(angle);
                var y_dist        = distance * Math.sin(angle);
                var collision     = ig.game.collisionMap ;
                //if collision between the player and the enemy occurs
                //collision.trace is actually the way ImpactJS simulates line of sight and will be explained later on
                var res = collision.trace( this.entity.pos.x,this.entity.pos.y,x_dist,y_dist,
                    this.entity.size.x,this.entity.size.y);

                if( res.collision.x){
                    if(angle > 0){return this.doAction(ig.ai.ACTION.MoveUp);}else{return this.doAction(ig.ai.ACTION.MoveDown);}
                }
                if(res.collision.y){
                    if(Math.abs(angle) > Math.PI / 2){return this.doAction(ig.ai.ACTION.MoveLeft)}else{return this.doAction(ig.ai.ACTION.MoveRight);}
                }
                if(distance < 200){
                    //decide between attacking, blocking or just being lazy //
                   // var decide = Math.random();
                    //if(decide < 0.3){return this.doAction(ig.ai.ACTION.Block);}
                    return this.doAction(ig.ai.ACTION.Attack);
                    //return this.doAction(ig.ai.ACTION.Rest);
                }
                if( distance > 200 && distance < 450) {
                    //if you can walk in a straight line: go for it
                    if(Math.abs(angle) < Math.PI / 4){ return this.doAction(ig.ai.ACTION.MoveRight); }
                    if(Math.abs(angle) >  3 * Math.PI / 4) {return this.doAction(ig.ai.ACTION.MoveLeft);}
                    if(angle < 0){return this.doAction(ig.ai.ACTION.MoveUp);}
                    return this.doAction(ig.ai.ACTION.MoveDown);
                }
                return this.doAction(ig.ai.ACTION.Rest);
            }
        })
    })