package com.kresehazirlik.domain;
public enum SkillLevel {
    IND(3), REM(2), HELP(1), NOT(0), NA(null);
    private final Integer value;
    SkillLevel(Integer v){ this.value = v; }
    /** NA hiçbir ortalamaya girmez. */
    public Integer value(){ return value; }
}
