using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 挂在按钮或带 Collider2D 的物体上；点击/触发时输出与网页一致的 action 日志。
/// </summary>
public class HotspotAction : MonoBehaviour
{
    [Tooltip("如 explore / npc:zhou / learn / exit")]
    public string actionId = QingheActions.Explore;

    public void Trigger()
    {
        string line = QingheActions.LogLine(actionId);
        Debug.Log(line);
    }

    // UGUI Button 可绑这个
    public void OnClick()
    {
        Trigger();
    }

    // 若用 2D 触发器 + 点击（需自行射线），也可调 Trigger()
    void OnMouseDown()
    {
        // 仅当物体有 Collider 且相机非仅 UI 时生效；UGUI 路径请用 Button.onClick
        Trigger();
    }
}
