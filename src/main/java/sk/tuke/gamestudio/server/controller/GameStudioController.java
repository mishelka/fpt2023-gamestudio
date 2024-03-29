package sk.tuke.gamestudio.server.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class GameStudioController {
    @RequestMapping("/")
    public String mainPage(){return "index";}

    @RequestMapping("/miska-rest")
    public String minesMiskaRest(){return "mines-miska-rest";}

    @RequestMapping("/miska-client")
    public String minesMiskaClient(){return "mines-miska-client-side";}
}