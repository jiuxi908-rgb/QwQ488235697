/// <summary>
/// 与网页 docs/id_map.json → hotspots.qinghe 对齐。
/// 日志格式：qinghe:{token}
/// </summary>
public static class QingheActions
{
    public const string LocationId = "qinghe";

    public const string Explore = "explore";
    public const string NpcZhou = "npc:zhou";
    public const string NpcSu = "npc:su";
    public const string Learn = "learn";
    public const string Exit = "exit";

    public static readonly string[] All =
    {
        Explore,
        NpcZhou,
        NpcSu,
        Learn,
        Exit
    };

    public static string LogLine(string actionId)
    {
        return LocationId + ":" + actionId;
    }
}
