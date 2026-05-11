using System.Threading.Tasks;

namespace EMS.Services
{
    public interface IIncrementProcessor
    {
        Task<int> ProcessPendingIncrementsAsync();
    }
}
